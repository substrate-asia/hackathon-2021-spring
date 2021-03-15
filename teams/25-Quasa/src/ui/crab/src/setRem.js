window.onresize=function(){
    setSize()
}
function setSize(){
    var width=document.documentElement.offsetWidth
    console.log("🚀 ~ file: setRem.js ~ line 6 ~ setSize ~ width", width, width / 375 * 100)
    var html=document.getElementsByTagName('html')[0]
    if(width<768){
        html.style.fontSize = width / 375 * 100 + 'px'
    }else{
        html.style.fontSize = '100px'
    }
}
setSize()
