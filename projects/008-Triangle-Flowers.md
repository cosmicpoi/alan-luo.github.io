---
layout: stub
title: Triangle Flowers
permalink: /project/tris.html
thumb: tris.gif
number: '008'
tags: art featured code
head: <style type="text/css">* {margin:0;padding:0;}</style>
---
<body style="position:absolute; top:0; left:0; width:100%; height:100%;">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<canvas id="canvas" style="margin:0;padding:0;width:100%;height:100%;"></canvas>

<script type="text/javascript">
// this is just stuff to make it work on the alanluo.com homepage
canvas = document.getElementById("canvas");
ctx = canvas.getContext('2d');
canv = $("#canvas");
canv.unbind();
getTime = () => (Date.now()-starttime);
canv.attr('width',$('body').width());
canv.attr('height',$('body').height());
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.translate(canvas.width/2, canvas.height/2);

/* so here's the basic structure of the program
- there's a 'triangles' array which stores all the triangles
- each frame, each of these triangles is re-rendered with a width, height, and rotation
- each frame, a new width, height, and rotation is calculated for these triangles
- the new w/h/r is calculated from derivative functions, which are formulated with respect to lifetime at the initialization of each tri
- this also means that each tri stores a lifetime variable
- when that lifetime variable is too large, the tri gets killed off by having its height derivative set to -1
- with this structure set up, all that's left is to initialize tris on click
*/

// set up the triangle array
triangles = [];

// stores mouse position
mouse = {x:0, y:0}; 
// always update the position of the mouse (in canvas coordinates, not global)
$("#canvas").mousemove(function(event) { 
    mouse.x = event.pageX-$(this).offset().left;
    mouse.y = event.pageY-$(this).offset().top;
});

/*
triangles are drawn by side length + altitude + rotation
they're isoceles triangles, the side length is the non-similar side
"scale" in the below code just determines how fast these things change, and is an adjustible parameter
*/
// the set of all possible rotation derivatives
drs = [
(scale) => ((time, click) => { 
    // the "click" variable makes the triangle expand while the mouse is held down at init
    if(click) return scale*(0.01);
    else return scale*(0.02+0.01*Math.sin(0.1*time));
}),
(scale) => ((time, click) => {
    if(click) return 0.01;
    else {
        if(time % 400 > 200) {
            return scale*(0.01*Math.sqrt(0.1*(time% 400)));
        } else {
            return scale*(-0.01*Math.sqrt(0.1*(time% 400)));
        }
    }
}),
(scale) => ((time, click) => {
    if(click) return 0.01;
    else {
        if(time % 240 < 60) {
            return scale*(0.000666667*(time % 240));
        } else if(time % 240 < 180) {
            return scale*(0.04);
        } else {
            return scale*(0.04-0.000666667*(time % 240 - 180));
        }
    }
}),
];
// the set of all possible altitude derivatives
das = [
(scale, scale2) => ((time, click) => {
    if(click) return 2*scale2;
    else return scale*(1*Math.sin(0.05*time));
}),
(scale, scale2) => ((time, click) => {
    if(click) return scale2*2;
    else {
        if(time % 400 < 200) {
            return scale*(0.1*Math.sqrt(0.1*(time% 400)));
        } else {
            return scale*(-0.1*Math.sqrt(0.1*(time% 400 - 200)));
        }
    }
}),
(scale, scale2) => ((time, click) => {
    if(click) return scale2*2;
    else {
        if(time % 240 < 60) {
            return scale*10*(-0.04+(0.000666667*(time % 240)));
        } else if(time % 240 < 180) {
            return 0;
        } else {
            return scale*10*(0.000666667*(time % 240 - 180));
        }
    }
}),
];
// the set of all possible side length derivatives
dss = [
(scale, scale2) => ((time, click) => {
    if(click) return 1*scale2;
    else return scale*(1.5*Math.sin(0.05*time));
}),
(scale, scale2) => ((time, click) => {
    if(click) return 0.1*scale2;
    else return scale*(1.5*Math.sin(0.05*time));
}),
(scale, scale2) => ((time, click) => {
    if(click) return scale2*1;
    else {
        if(time % 400 < 200) {
            return scale*(0.1*Math.sqrt(0.1*(time% 400)));
        } else {
            return scale*(-0.1*Math.sqrt(0.1*(time% 400 - 200)));
        }
    }
}),
(scale, scale2) => ((time, click) => {
    if(click) return scale2*1;
    else {
        if(time % 240 < 60) {
            return scale*(0.000666667*(time % 240));
        } else if(time % 240 < 180) {
            return scale*(0.04);
        } else {
            return scale*(0.04-0.000666667*(time % 240 - 180));
        }
    }
}),
]

//just an easy helper function
randomSign = () => (Math.random()>0.5) ? 1 : -1; 

//define click event for initialization - we want to make one bloom on each click
$("#canvas").mousedown(function() {
    //set up a random number of petals from 3 to 12
    var petals = Math.floor(Math.random()*10)+3;

    //set up an initial side length and color
    let side = 30+Math.random()*60;
    let color = hslStr(Math.random()*360, 80, 50, 0.7);
    //select a random derivative function for the three drawing variables
    let drf = drs[Math.floor(Math.random()*drs.length)](1*(0.5+Math.random())*randomSign());
    let daf = das[Math.floor(Math.random()*das.length)](1*(0.5+Math.random())*randomSign(), 0.5+Math.random());
    let dsf = dss[Math.floor(Math.random()*dss.length)](1*(0.5+Math.random())*randomSign(), 0.5+Math.random());
    // random (10%) chance to add a pointy one
    if(Math.random()<0.1) { 
        side = 2;
        dsf = (time, click) => 0; petals = 20+Math.floor(Math.random()*20)
    }

    //now add the triangles to the array - note that each triangle in each bloom has the same d functions
    for(let i=0; i<petals; i++) {
        let newtri = new Triangle(mouse.x, mouse.y, 0, side, color, (i/petals)*2*Math.PI);
        newtri.dr= drf;
        newtri.da= daf;
        newtri.ds= dsf;
        newtri.maxLife = 600;
        triangles.push(newtri);
    }
}).mouseup(function() { // slightly naive way to handle mouseup events
    for(var i=0; i<triangles.length; i++) {
        triangles[i].clicking = false;
    }
});

function reDraw() {
    canvasDraw();
    window.requestAnimationFrame(reDraw);        
}
window.requestAnimationFrame(reDraw);


Triangle = function(x, y, altitude, sidelength, color, rotation) {
    this.x = x; this.y = y;
    this.altitude = altitude; this.sidelength = sidelength; 
    this.color = color; this.rotation = rotation;
    this.lifetime=0; this.clicking = true;
    //each differential is a funciton of lifetime and clicking
    this.da = (a, b) => 0;
    this.ds = (a, b) => 0;
    this.dr = (a, b) => 0;
    this.dead = false;

    this.kill = function() {
        this.dead = true;
        this.da = (a, b) => (-1);
        this.ds = (a, b) => (-1);
    }
}
hslStr = function(h, s, l, a) {
    return "hsla("+h+","+s+"%,"+l+"%,"+a+")";
}
drawTri = function(tri) {
    ctx.fillStyle = tri.color;

    ctx.save();
    ctx.translate(tri.x, tri.y);
    ctx.rotate(tri.rotation);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tri.sidelength/2, tri.altitude);
    ctx.lineTo(-tri.sidelength/2, tri.altitude);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}
canvasDraw = function() {
    canv.attr('width',$('#canvas').width());
    canv.attr('height',$('#canvas').height());

    ctx.fillStyle = "#112233";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for(let i=0; i<triangles.length; i++) {
        const tri = triangles[i];
        drawTri(tri);

        tri.altitude+=tri.da(tri.lifetime, tri.clicking);
        tri.sidelength+=tri.ds(tri.lifetime, tri.clicking);
        tri.rotation+=tri.dr(tri.lifetime, tri.clicking);

        tri.lifetime++;

        if(tri.lifetime==tri.maxLife) {
            triangles[i].kill();
        }
        if(tri.dead && tri.altitude<5 ) {
            triangles.splice(i, 1);
        }
    }
}


//init stuff - this only runs once (so that the canvas isn't boring on load)
//it just makes a bunch of flowers that immediately disappear
function makeDyingBloom(x, y) {
    let side = 30+Math.random()*60;
    let drf = drs[0](1);
    let daf = (side, click) => (-2);
    let dsf = (side, click) => (-2);

    let color = hslStr(Math.random()*360, 80, 50, 0.7);
    for(let i=0; i<10; i++) {
        let newtri = new Triangle(x, y, 150, 150, color, (i/10)*2*Math.PI);
        newtri.dr= drf;
        newtri.da= daf;
        newtri.ds= dsf;
        newtri.maxLife = 30;
        triangles.push(newtri);
    }
}
for(var i=0; i<10; i++) {
    makeDyingBloom(Math.random()*canvas.width,Math.random()*canvas.height);    
}

</script>
</body>