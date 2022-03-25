'use strict'


function CountNeighbors(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j].isMine
            if (cell) {
                count++
            }
        }
    }
    return count
}

function getNeighbors(board, rowIdx, colIdx) {
    var neighborsPos = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell) {
                neighborsPos.push({ i: i, j: j })
            }
        }
    }
    return neighborsPos
}

function getNeighborsForRecursion(board, rowIdx, colIdx) {
    var neighborsPos = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isShown) continue
            if (board[i][j].isMarked) continue
            //if (board[i][j].minesAroundCount > 0) continue
            var cell = board[i][j]
            if (cell) {
                neighborsPos.push({ i: i, j: j })
            }
        }
    }
    return neighborsPos
}

function printBoard(board) {
    var bingoBoardRows = []
    var bingoBoardColumns = []

    for (let i = 0; i < board.length; i++) {
        var currRow = board[i]
        for (let j = 0; j < currRow.length; j++) {
            var cell = board[i][j].isMine ? '*' : board[i][j].minesAroundCount;
            bingoBoardColumns.push(cell)
        }
        bingoBoardRows.push(bingoBoardColumns)
        bingoBoardColumns = []
    }
    console.table(bingoBoardRows);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getEmptyCellsBoard(board) {
    var emptyCellsBoard = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].isShown && !board[i][j].isMine) {
                emptyCellsBoard.push({ i: i, j: j })
            }
        }
    }
    return emptyCellsBoard
}

function CopyMat(board) {
    var newBoard = []
    for (var i = 0; i < board.length; i++) {
        newBoard[i] = []
        for (var j = 0; j < board[0].length; j++) {
            newBoard[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isShown: board[i][j].isShown,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }
    }
    return newBoard
}

function renderBoardUndo(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {

            var className = 'cell cell-' + i + '-' + j;

            var cell;
            if (!mat[i][j].isShown && mat[i][j].isMarked) {
                cell = FLAG
                className += ' hideCell'
            }
            else if (mat[i][j].isShown) {
                if (mat[i][j].isMine) { cell = MINE }
                if (mat[i][j].minesAroundCount >= 0) { cell = mat[i][j].minesAroundCount }
                className += ' showCell'
            } else {
                cell = WINDOW
                className += ' hideCell'
            }


            var dataSet = `data-i="${i}" data-j="${j}"`
            var clicked = `onmouseup="cellClicked(event.button, this, ${i}, ${j})"`
            strHTML += '<td class="' + className + '"' + clicked + ' ' /*+ dataSet*/ + ' > ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}