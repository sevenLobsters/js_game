var game = {
    init:function(){
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");
        levels.init();
        loader.init();
        mouse.init();
        game.hideScreens();
        game.showScreen("gamestartscreen");
    },

    hideScreens:function(){
        var screens = document.getElementsByClassName("gamelayer");
        for(let i = screens.length-1;i>=0;i--){
            var screen = screens[i];
            screen.style.display="none";
        }
    },

    hideScreen:function(id){
        var screen = document.getElementById(id);
        screen.style.display = "none";
    },

    showScreen:function(id){
        var screen = document.getElementById(id);
        screen.style.display = "block";
    },

    showLevelScreen:function(){
        game.hideScreens();
        game.showScreen("levelselectscreen");
    },

    mode:"intro",
    //弹弓坐标。
    slingshotX:140,
    slingshotY:280,
    //橡皮筋绑定点。
    slingshotBandX:140+55,
    slingshotBandY:280+23,
//游戏结束
    ended:false,
    //游戏分数
    score:0,
    //x轴从左到右偏移。
    offsetLeft:0,

    start:function(){
        game.hideScreens();

        game.showScreen("gamecanvas");
        game.showScreen("scorescreen");

        game.mode = "intro";
        game.currentHero = undefined;

        game.offsetLeft = 0;
        game.ended = false;

        game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
    },
    
    maxSpeed:3,
    //移动屏幕使新中心为中心。
    panTo:function(newCenter){
        //最小移动距离
        var minOffset = 0;
        //最大移动过距离
        var maxOffset = game.currentLevel.backgroundImage.width-game.canvas.width;
        //屏幕的中心
        var currentCenter = game.offsetLeft+game.canvas.width/2;

        if(Math.abs(newCenter-currentCenter)>0 && game.offsetLeft <= maxOffset
        && game.offsetLeft >= minOffset){

            var deltaX =(newCenter-currentCenter)/2;
            
            if(Math.abs(deltaX)>game.maxSpeed){
                deltaX = game.maxSpeed*Math.sign(deltaX);
            }

            if(Math.abs(deltaX)<=1){
                deltaX = (newCenter - currentCenter);
            }
            game.offsetLeft +=deltaX;

            if(game.offsetLeft <= minOffset){
                game.offsetLeft = minOffset;
                return true;
            } else if(game.offsetLeft>=maxOffset){
                game.offsetLeft = maxOffset;
                return true;
            }

        } else{
            return true;
        }
    },

    handleGameLogic:function(){
        if(game.mode === "intro"){
            if(game.panTo(700)){
                game.mode="load-next-hero";
            }
        }

        if(game.mode === "wait-for-firing"){
            if(mouse.dragging){
                game.panTo(mouse.x+game.offsetLeft);
            } else{
                game.panTo(game.slingshotX);
            }
        }

        if(game.mode === "load-next-hero"){
            game.mode = "wait-for-firing"
        }

        if(game.mode === "firing"){

        }

        if(game.mode === "fired"){

        }

        if(game.mode ==="level-success" || game.mode === "level-failure"){

        }


    },

    animate:function(){
        game.handleGameLogic();

        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,
            game.canvas.width,game.canvas.height,0,0,game.canvas.width,game.canvas.height);
        game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,
            game.canvas.width,game.canvas.height,0,0,game.canvas.width,game.canvas.height) ; 
        
        game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
        game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

        if(!game.ended){
            game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
        }
    },
    
};

var levels = {
    data:[{
        foreground:"desert-foreground",
        background:"clouds-background",
        entities:[]
    },{
        foreground:"desert-foreground",
        background:"clouds-background",
        entities:[]
    }
    ],

    init:function(){
        var levelselectscreen = document.getElementById("levelselectscreen");

        var buttonClickHandler = function(){
            game.hideScreen("levelselectscreen");
            levels.load(this.value-1);
        };

        for(let i = 0;i<levels.data.length;i++){
            var button = document.createElement("input");
            button.type = "button";
            button.value = (i+1);
            button.addEventListener("click",buttonClickHandler);
            levelselectscreen.appendChild(button);
        }
    },

    load:function(number){
        game.currentLevel = {number:number};
        game.score = 0;

        document.getElementById("score").innerHTML="Score:"+game.score;
        var level = levels.data[number];

        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
        game.slingshotImage = loader.loadImage("images/slingshot.png")
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");
        loader.onload = game.start;

    }
};

var loader = {
    loaded:true,
    loadedCount:0,
    totalCount:0,

    init:function(){
        var mp3Support,oggSupport;
        var audio = document.createElement("audio");
        if(audio.canPlayType){
            mp3Support == ""!==audio.canPlayType("audio/mpeg");
            oggSupport == ""!==audio.canPlayType("audio/ogg;codecs=\"vorbis\"");
        } else{
            mp3Support = false;
            oggSupport = false;
        }
        
        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;
    },

    loadImage: function(url){
        this.loaded = false;
        this.totalCount++;
        game.showScreen("loadingscreen");
        var image = new Image();
        image.addEventListener("load",loader.itemLoaded,false);
        image.src = url;
        return image;
    },
    soundFileExtn:".ogg",

    loadSound:function(url){
        this.loaded = false;
        this.totalCount++;
        game.showScreen("loadingscreen");
        var audio = new Audio();
        audio.addEventListener("canplaythrough",loader.itemLoaded,false);
        audio.src = url+loader.soundFileExtn;
        return audio;
    },

    itemLoaded:function(ev){
        ev.target.removeEventListener(ev.type,loader.itemLoaded,false);
        loader.loadedCount++;
        if(loader.loadedCount === loader.totalCount){
            loader.loaded = true;
            loader.loadedCount = 0;
            loader.totalCount = 0;

            game.hideScreen("loadingscreen");

            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
};

var mouse = {
    x:0,
    y:0,
    down:false,
    dragging:false,

    init:function(){
        var canvas = document.getElementById("gamecanvas");
        canvas.addEventListener("mousemove",mouse.mousemovehandler,false);
        canvas.addEventListener("mousedown",mouse.mousedownhandler,false);
        canvas.addEventListener("mouseup",mouse.mouseuphandler,false);
        canvas.addEventListener("mouseout",mouse.mouseouthandler,false);
    },

    mousemovehandler:function(ev){
        var offset = game.canvas.getBoundingClientRect();
        mouse.x = ev.clentX - offset.left;
        mouse.y = ev.clientY - offset.top;

        if(mouse.down){
            mouse.dragging = true;
        }

        ev.preventDefault();
    },

    mousedownhandler:function(ev){
        mouse.down = true;
        ev.preventDefault();
    },

    mouseuphandler:function(ev){
        mouse.down = false;
        mouse.dragging = false;
        ev.preventDefault();
    }
};

window.addEventListener("load",function(){
    game.init();
});