const SquareSize = 44;
const SquareSizeUnit = 'px';
const Board = document.querySelector('#board');
let virtualBoard = [];
let gameActive = true;
const difficulty = 5;

function initialiseGame() {
    const BoardDimensions = getBoardDimensions();
    console.log(BoardDimensions);
    generateBoard(BoardDimensions);
    placeMines(BoardDimensions);

    createClickEvents();
}

function getBoardDimensions() {
    const Rows = Math.floor((window.innerHeight - 44)/SquareSize);
    const Columns = Math.floor((window.innerWidth - 44)/SquareSize);
    return {
        rows: Rows,
        columns: Columns,
    };
}

function generateBoard(BoardDimensions) {
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
                    console.log(self.clicked);
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
                    console.log(minesTouching);
                    virtualBoard[row][column].clicked = true;
                    setSquareValue(row,column,minesTouching);
                    if( minesTouching < 1) clickAdjacentSquares(row,column,BoardDimensions);
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
    // console.log(virtualBoard);
}

function placeMines(BoardDimensions) {
    for (let mine = 0; mine < (BoardDimensions.rows * difficulty); mine++) {
        const row = getRandomInt(BoardDimensions.rows);
        const col = getRandomInt(BoardDimensions.columns);
        // will need a while loop that checks that the mine hasn't already been placed.
        virtualBoard[row][col].isMine = true;
        console.log(row+','+col);
    }
}

function setSquareValue(row, column, value) {
    const element = document.querySelector(`#row${row}col${column}`);
    element.innerHTML = value;
    element.classList.add('clicked');
    if(value === 'M') {
        element.classList.add('red');
    } else {
        element.classList.add(`n${value}`);
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
        })
    });
}

function youLose() {
    console.log('youlose');
    gameActive = false;
}

function clickAdjacentSquares(row,col,BoardDimensions) {

    if( row - 1 >= 0 && col - 1 >= 0 ) virtualBoard[row-1][col-1].isNearMine();
    if( row - 1 >= 0 ) virtualBoard[row-1][col].isNearMine();
    if( row - 1 >= 0 && col + 1 < BoardDimensions.columns ) virtualBoard[row-1][col+1].isNearMine();
    if( col - 1 >= 0 ) virtualBoard[row][col-1].isNearMine();
    if( col + 1 < BoardDimensions.columns ) virtualBoard[row][col+1].isNearMine();
    if( row + 1 < BoardDimensions.rows && col - 1 >= 0 ) virtualBoard[row+1][col-1].isNearMine();
    if( row + 1 < BoardDimensions.rows) virtualBoard[row+1][col].isNearMine();
    if( row + 1 < BoardDimensions.rows && col + 1 < BoardDimensions.columns) virtualBoard[row+1][col+1].isNearMine();
}


initialiseGame();