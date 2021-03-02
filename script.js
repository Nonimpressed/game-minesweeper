const SquareSize = 44;
const SquareSizeUnit = 'px';
const Board = document.querySelector('#board');
let virtualBoard = [];
let gameActive = true;
let difficulty = 1;
const MaxBoardDimension = 20;
let BoardDimensions = {};
let MinesRemaining = 0;
let SquaresRemaining = 0;
let startTime = null;

document.querySelector('#startTheGame').addEventListener('click', e => {
    resetGame();
    difficulty = document.querySelector('#diff').value;
    document.querySelector('#difficulty').classList.remove('active');
    initialiseGame();
});

document.querySelectorAll('.play-again').forEach( el => {
    el.addEventListener('click', () => {
        document.querySelector('#lose').classList.remove('active');
        document.querySelector('#win').classList.remove('active');
        resetGame();
        initialiseGame();
    });
});

document.querySelectorAll('.change-diff').forEach( el => {
    el.addEventListener('click', () => {
        document.querySelector('#lose').classList.remove('active');
        document.querySelector('#win').classList.remove('active');
        document.querySelector('#difficulty').classList.add('active');
    })
})

function initialiseGame() {
    BoardDimensions = getBoardDimensions();
    console.log('Board Dimensions:');
    console.log(BoardDimensions);
    generateBoard();
    placeMines();
    reportTotalMines()
    createClickEvents();
    reportRemainingSquares();

    startTime = document.timeline.currentTime;
    beginTimer(startTime);
}

function resetGame() {
    virtualBoard = [];
    gameActive = true;
    BoardDimensions = {};
    MinesRemaining = 0;
    SquaresRemaining = 0;
    startTime = null;
}

function getBoardDimensions() {
    const Rows = Math.floor((window.innerHeight - 44)/SquareSize);
    const Columns = Math.floor((window.innerWidth - 44)/SquareSize);
    return {
        rows: (Rows < MaxBoardDimension ? Rows : MaxBoardDimension ),
        columns: (Columns < MaxBoardDimension ? Columns : MaxBoardDimension),
    };
}

function generateBoard() {
    // init html
    let squareHTML = '';

    for (let row = 0; row < BoardDimensions.rows; row++) {
        squareHTML += '<div class="row">';

        virtualBoard.push([]);
        for (let column = 0; column < BoardDimensions.columns; column++) {
            squareHTML += `<div id="row${row}col${column}" data-row="${row}" data-col="${column}" class="square" style="min-width: ${SquareSize+SquareSizeUnit}; min-height:  ${SquareSize+SquareSizeUnit};"></div>`;

            virtualBoard[row][column] = {
                clicked: false,
                isMine: false,
                isNearMine: function() {
                    let self = virtualBoard[row][column];
                    // console.log(self.clicked);
                    if(self.clicked === true) return;
                    if(self.isMine === true) {
                        setSquareValue(row,column,'M');
                        youLose();
                        return;
                    }
                    let minesTouching = 0;
                    if(self.topLeft() === true) minesTouching++
                    if(self.top() === true) minesTouching++
                    if(self.topRight() === true) minesTouching++
                    if(self.left() === true) minesTouching++
                    if(self.right() === true) minesTouching++
                    if(self.bottomLeft() === true) minesTouching++
                    if(self.bottom() === true) minesTouching++
                    if(self.bottomRight() === true) minesTouching++
                    // console.log(minesTouching);
                    virtualBoard[row][column].clicked = true;
                    setSquareValue(row,column,minesTouching);
                    
                    if( minesTouching < 1) clickAdjacentSquares(row,column);
                },
                topLeft: function() {
                    if( row - 1 < 0 || column - 1 < 0 ) return false;
                    return virtualBoard[row-1][column-1].isMine;
                },
                top: function() {
                    if( row - 1 < 0 ) return false;
                    return virtualBoard[row-1][column].isMine;
                },
                topRight: function() {
                    if( row - 1 < 0 || column + 1 >= BoardDimensions.columns ) return false;
                    return virtualBoard[row-1][column+1].isMine;
                },
                left: function() {
                    if( column - 1 < 0 ) return false;
                    return virtualBoard[row][column-1].isMine;
                },
                right: function() {
                    if( column + 1 >= BoardDimensions.columns ) return false;
                    return virtualBoard[row][column+1].isMine;
                },
                bottomLeft: function() {
                    if( row + 1 >= BoardDimensions.rows || column - 1 < 0 ) return false;
                    return virtualBoard[row+1][column-1].isMine;
                },
                bottom: function() {
                    if( row + 1 >= BoardDimensions.rows) return false;
                    return virtualBoard[row+1][column].isMine;
                },
                bottomRight: function() {
                    if( row + 1 >= BoardDimensions.rows || column + 1 >= BoardDimensions.columns) return false;
                    return virtualBoard[row+1][column+1].isMine;
                }
            }
        }
        squareHTML += '</div>';
    }

    Board.innerHTML = squareHTML;
}

function placeMines() {
    const maxMines = (BoardDimensions.rows * difficulty);
    for (let i = 0; i < maxMines; i++) {
        let row = getRandomInt(BoardDimensions.rows);
        let col = getRandomInt(BoardDimensions.columns);
        // if(virtualBoard[row][col].isMine === true) return;
        virtualBoard[row][col].isMine = true;
    }
}

function reportTotalMines() {
    let total = 0;
    for (let row = 0; row < BoardDimensions.rows; row++) {
        for (let column = 0; column < BoardDimensions.columns; column++) {
            if(virtualBoard[row][column].isMine) total++;
        }
    }
    MinesRemaining = total;
    document.querySelector('#mineTotal').innerHTML = total;
}

function setSquareValue(row, column, value) {
    const element = document.querySelector(`#row${row}col${column}`);
    element.classList.add('clicked');
    if(value === 'M') {
        element.classList.add('red');
    } else {
        element.classList.add(`n${value}`);
        element.innerHTML = value;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function createClickEvents() {
    const Squares = document.querySelectorAll('.square');
    Squares.forEach(square => {
        square.addEventListener('click', e => {
            e.preventDefault();
            if(!gameActive) return;
            const row = e.target.dataset.row;
            const col = e.target.dataset.col;
            virtualBoard[row][col].isNearMine();
            reportRemainingSquares();
        })
    });
}

function youLose() {
    document.querySelector('#lose').classList.add('active');
    console.log('youlose');
    gameActive = false;
}

function clickAdjacentSquares(row,col) {
    if( row - 1 >= 0 && col - 1 >= 0 ) virtualBoard[row-1][col-1].isNearMine();
    if( row - 1 >= 0 ) virtualBoard[row-1][col].isNearMine();
    if( row - 1 >= 0 && col + 1 < BoardDimensions.columns ) virtualBoard[row-1][col+1].isNearMine();
    if( col - 1 >= 0 ) virtualBoard[row][col-1].isNearMine();
    if( col + 1 < BoardDimensions.columns ) virtualBoard[row][col+1].isNearMine();
    if( row + 1 < BoardDimensions.rows && col - 1 >= 0 ) virtualBoard[row+1][col-1].isNearMine();
    if( row + 1 < BoardDimensions.rows) virtualBoard[row+1][col].isNearMine();
    if( row + 1 < BoardDimensions.rows && col + 1 < BoardDimensions.columns) virtualBoard[row+1][col+1].isNearMine();
}

function reportRemainingSquares() {
    const squares = document.querySelectorAll('.square');
    let remaining = 0;
    squares.forEach(el => {
        if( !el.classList.contains('clicked')) remaining++;
    });
    SquaresRemaining = (remaining - MinesRemaining);
    document.querySelector('#remaining').innerHTML = SquaresRemaining;

    if(SquaresRemaining < 1) youWin();
}

function youWin() {
    document.querySelector('#win').classList.add('active');
    console.log('youwin');
    gameActive = false;
}

function beginTimer(time) {
    const elapsed = time - startTime;
    const seconds = Math.round(elapsed / 1000);
    updateTimer(seconds);
    const targetNext = (seconds + 1) * 1000 + startTime;
    setTimeout(
        () => {
            if(!gameActive) return;
            requestAnimationFrame(beginTimer);
        }, 
        targetNext - performance.now(),
    );
}

function updateTimer(seconds) {
    document.querySelector('#timer').innerHTML = seconds+'s';
}

// initialiseGame();

// TODO
// add duplicate mine detection and re-roll.
// Add difficuly select before game starts. make it max out at 50% mines
// Add you lose popup over the top
// Add a tracker to show how many mines remaining.
// Add win popup over the top
