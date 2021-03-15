use std::process::Command;

const BUILD_INFO_FALLBACK: &str = "Unknown";

fn run_command(program: &str, args: &[&str]) -> String {
    if let Ok(o) = Command::new(program).args(args).output() {
        let raw_output = String::from_utf8_lossy(&o.stdout).into_owned();
        raw_output.trim().to_string()
    } else {
        BUILD_INFO_FALLBACK.to_string()
    }
}

fn set_env(var: &str, value: String) {
    println!("cargo:rustc-env={}={}", var, value);
}

fn main() {
    set_env("BUILD_GIT_HASH", run_command("git", &["rev-parse", "HEAD"]));
    set_env(
        "BUILD_GIT_BRANCH",
        run_command("git", &["rev-parse", "--abbrev-ref", "HEAD"]),
    );
    set_env("BUILD_RUSTC_VERSION", run_command("rustc", &["--version"]));
    println!("cargo:rerun-if-changed=.git/HEAD");
}
