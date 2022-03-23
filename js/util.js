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

function getEmptyCellsBoard(board, WhatIsNotEmpty) {
    var emptyCellsBoard = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== WhatIsNotEmpty) {
                emptyCellsBoard.push({ i: i, j: j })
            }
        }
    }
    return emptyCellsBoard
}
