const gulp = require("gulp");
const clean = require("gulp-clean");
const ts = require('gulp-typescript');
const zip = require('gulp-zip');
const watch = require('gulp-watch');
const path = require('path');

const tsProject = ts.createProject("./tsconfig.json", { declaration: false });

const ZIP_FILE_NAME = "mgobexs.zip";
const JS_FILE_PATH = "./";

const TSC_PATH = [
    "./**/*.ts",
    "!./node_modules/**",
];

gulp.task("cleanZip", function () {
    return gulp.src("../" + ZIP_FILE_NAME, { read: false, allowEmpty: true }).pipe(clean({ force: true }));
});

gulp.task("tsc", function () {
    return gulp.src(TSC_PATH).pipe(tsProject()).js.pipe(gulp.dest(JS_FILE_PATH));
});

gulp.task("zip", function () {
	const name = path.resolve(__dirname).split(path.sep).pop();
    return gulp.src('../@(' + name + ')/**').pipe(zip(ZIP_FILE_NAME)).pipe(gulp.dest("../"));
});

gulp.task("default", gulp.series("cleanZip", "tsc", "zip"));

gulp.task("watch", function () {
    return watch('./**/*.ts', gulp.series("default"));
});