const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
let score=document.querySelector(".score");
let title=document.querySelector("h2");
let btn=document.querySelector("button");

const row=20;
const  column=10;
const sq=30;
const vacant= "#fff5f8";

let lvl=0;
let speed=250;
let round=1;
let highScore = localStorage.getItem('highScore') || 0;
let plvl;
let p;
let game;
let nextLevelAt = 50;

let started=false;
let gameOver=false;
let paused = false;

const Pieces=[
    [T,"#c4476a"],   
    [O,"#e8859f"],   
    [I,"#7a9fd4"],   
    [J,"#9b7abf"],   
    [S,"#7abfb0"],   
    [Z,"#d4906a"],   
    [L,"#a85878"] 
];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('high-score-display').innerText = highScore;
});

document.addEventListener("keydown",function(event){
    if (started==false && event.code === 'ArrowDown'){
        started= true;
        console.log("Game Started");
        document.querySelector('.score').innerText= `Level 1`;
        spawnPiece();
        startInterval();
    }else if (event.code=='ArrowUp'){
        p.rotate();
    }else if(event.code=='ArrowRight'){
        p.rightMove();
    }else if(event.code=='ArrowLeft'){
        p.leftMove();
    }else if(event.code === 'KeyP'){
        togglePause();
    } 
});

function drawSquare(x,y,color){
    ctx.fillStyle=color;
    ctx.fillRect(x*sq,y*sq,sq,sq);
    
    ctx.strokeStyle =  "#e8c0cc";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x*sq,y*sq,sq,sq);
}
 
//creating board 
let board=[];
for (let i=0 ; i< row; i++){
    board[i]=[];
    for (let j=0;j< column;j++){
        board[i][j]=vacant;
    }
}   

function drawingBoard(){
    for (let i=0 ; i< row; i++){
        for (let j=0;j< column;j++){
            drawSquare(j,i,board[i][j]);
        }
    }   
}  
drawingBoard();
 
function spawnPiece(){
    if (gameOver) return;

    let id = Math.floor(Math.random() * Pieces.length);
    p= new piece(Pieces[id][0],Pieces[id][1],id);
    p.draw();
    lvl++;
    document.getElementById('score-display').innerText = lvl; 
}

function togglePause() {
    if (!started || gameOver) return;
 
    const btn = document.getElementById('pause-btn');
 
    if (paused) {
        paused = false;
        btn.textContent = 'Pause';
        btn.classList.remove('paused');
        startInterval();
    } else {
        paused = true;
        btn.textContent = 'Resume';
        btn.classList.add('paused');
        clearInterval(game);
    }
}

function piece(shape,color,id){
    this.shape=shape;
    this.color=color;
    if(id!=1){
        let ro= Math.floor(Math.random()* 3) ;
        this.rotation=ro;
    } else {
        this.rotation=0;
    }
    this.activePiece=this.shape[this.rotation];
    this.id=id
    this.x=3;
    if (this.id>2){
        this.y=0;
    }else{
        this.y=-1;
    }
}

piece.prototype.draw=function(){
    for (let i=0 ; i< this.activePiece.length; i++){
        for (let j=0;j<this.activePiece[i].length;j++){
            if (this.activePiece[i][j]){
                drawSquare(this.x+j,this.y+i,this.color);
            }
        }
    } 
}

piece.prototype.unDraw=function(){
    for (let i=0 ; i< this.activePiece.length; i++){
        for (let j=0;j<this.activePiece[i].length;j++){
            if (this.activePiece[i][j]){
                drawSquare(this.x+j,this.y+i,vacant);
            }
        }
    } 
}
  
piece.prototype.moveDown=function(){
    if (!this.collison(0,1,this.activePiece)){
        p.unDraw();
        this.y++;
        p.draw();
    }else{
        this.lock();
        spawnPiece();
    }
    
}

function startInterval(){
    clearInterval(game);
    game = setInterval(function(){
        if(!gameOver && p){
            p.moveDown();
        }
    }, speed);
}

piece.prototype.rotate=function(){
    let nextPattern=this.shape[(this.rotation+1)% this.shape.length];
    if (!this.collison(0,0,nextPattern)){
        this.unDraw();
        this.rotation= (this.rotation+1)% this.shape.length;
        this.activePiece=this.shape[this.rotation];
        this.draw();
    }
    
}

piece.prototype.rightMove=function(){
    if (!this.collison(1,0,this.activePiece)){
        this.unDraw();
        this.x++;
        this.draw();
    }
    
}

piece.prototype.leftMove=function(){
    if (!this.collison(-1,0,this.activePiece)){
        this.unDraw();
        this.x--;
        this.draw();
    }   
}

piece.prototype.lock=function(){
    for (let i=0;i<this.activePiece.length;i++){
        for (let j=0;j<this.activePiece[i].length;j++){
            if (!this.activePiece[i][j]) continue;

            if (this.y+i-1<0){
                gameOver=true;
                clearInterval(game);
                if (lvl > highScore) {
                    highScore = lvl;
                    localStorage.setItem('highScore', lvl);
                }
                title.innerText=`GAME OVER!`;
                score.innerText=` Press Enter to restart`;
                document.querySelector('.score').innerText= `Level 1`;
                document.getElementById('high-score-display').innerText = highScore;
                console.log("GAME OVER");
                plvl=lvl;
                document.addEventListener("keydown" ,function (){
                    if (gameOver){
                        gameReset();
                    }
                });
            }
            if(this.y + i >= 0){
                board[this.y + i][this.x + j] = this.color;                
            }
        }   
    }
    lineClearing();
    drawingBoard();
    
}

piece.prototype.collison=function(x,y,activePiece){
    for (let i=0;i<this.activePiece.length;i++){
        for (let j=0;j<this.activePiece[i].length;j++){
            if (!this.activePiece[i][j]) continue;

            let newX=this.x+x+j;
            let newY=this.y+y+i;    
            
            if (newX<0) return true;
            if (newX>= column) return true;
            if (newY>= row) return true;
            if (newY<0) continue;

            if (board[newY][newX]!=vacant){
                return true;
            }
        }
   }
   return false;
}

function gameReset(){
    lvl=0;
    started= true;
    speed=250;
    gameOver=false;
    paused=false;
    for (let i=0 ; i< row; i++){
        for (let j=0;j< column;j++){
            board[i][j]=vacant;
        }
    }
    drawingBoard();
    title.innerText=`Tetris Game`;
    document.getElementById('score-display').innerText = 0; 
    document.querySelector('.score').innerText= `Level 1`;
    game=setInterval(function(){
        if(!gameOver && p){
            p.moveDown();
        }
    },speed);
}

function lineClearing(){
    for (let i=row-1;i>=0;i--){
        let lineFull=true;
        for (let j=column-1;j>=0;j--){
            if (board[i][j] == vacant){
                lineFull=false;
                break;
            }
        }
        if (lineFull){
            for(let m=0;m<column;m++)  {
                for(let n =i;n>0;n--){
                    board[n][m]=board[n-1][m];
                    board[n-1][m]=vacant;
                }
            }
            lvl=lvl+10;
            
            if (lvl >= nextLevelAt) {
                round++;
                document.querySelector('.score').innerText= `Level ${round}`;
                speed = Math.max(80, speed - 20);
                console.log(speed);
                nextLevelAt += 50;
                startInterval();
            }
        }
    }
}

