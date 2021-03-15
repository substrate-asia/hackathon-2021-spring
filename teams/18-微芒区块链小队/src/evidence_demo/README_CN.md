[English](./README.md) / 中文

# Evidence Demo

适配 Highway 与 FISCO BCOS 等联盟链的多链存证应用。

> 演示地址：
>
> https://elixir.leeduckgo.com/
>
> 管理员账号:
>
> 用户名：highway
>
> 密码： leeduckgo

##  Erlang 与 Elixir 安装

Erlang 安装：

> https://www.erlang-solutions.com/downloads/

Elixir 安装：

> https://elixir-lang.org/install.html

附：Ubuntu 安装 Cheatsheet

> 安装 Erlang
>
>    下载命令：wget http://www.erlang.org/download/[version].tar.gz
>
>    解压命令：tar -zxf otp_src_20.2.tar.gz
>
>    进入erlang目录命令：cd otp_src_20.2
>
>    sudo apt-get install openssl
>
>    sudo apt-get install libssl-dev
>
>    sudo apt-get install libncurses5-dev libncursesw5-dev
>
>    apt install libwxgtk3.0-dev
>
>    apt install unixodbc
>
>    Apt install unixodbc-dev
>
>    配置erlang环境：
>
>    ./configure
>
>    编译erlang：
>
>    sudo make&&make install
>
>    验证erlang：
>
>    erl
>
> 安装 Elixir
>
>    Add Erlang Solutions repository:
>
>    wget https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb && sudo dpkg -i erlang-solutions_2.0_all.deb
>
>    Run: sudo apt-get update
>
>    Install Elixir: sudo apt-get install elixir

## 安装 Postgres

> https://www.cnblogs.com/z-sm/p/5644165.html

## 执行初始化命令

进入`evidence_demo`文件夹。

执行：

```elixir
mix setup
```

复制`priv/repo/seeds.exs.template`为`priv/repo/seeds.exs`

```
cp priv/repo/seeds.exs.template priv/repo/seeds.exs
```

修改必要参数，包括`ip`信息、用户信息与合约信息。

初始化:


```elixir
mix run priv/repo/seeds.exs
```

## 运行程序

默认4000端口：

```
iex -S mix phx.server
```

默认 Admin 账号密码：highway/leeduckgo
