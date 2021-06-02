目前改项目中主要使跑起来整个工程
其中主要包括了
1.定义关卡数据
2.定义资源加载方法
3.定义鼠标处理事件。

game对象
游戏中init方法
显示和隐藏div。
背景图移动逻辑

levels
定义关卡数据，根据不同的管卡加载数据，

loader
加载并展示资源。

mouse
记录鼠标状态。

//注册监听
window.addEventListener("load",function(){
    game.init();
});