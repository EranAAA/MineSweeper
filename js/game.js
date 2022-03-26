'use strict'

const FLAG = '🚩'
const EXPLODE = '💥'
const MINE = '💣'
const FLAG_ON_MINE = '🏴'
const WINDOW = ''

var gTimer // ******Check if i use it.******

// For Undo Button
var gInitBoard = []
var gisInUndo = false

// For Recursion
var gCellsRecursion = [];

function cellClicked(evBtn, elCell, i, j) {

    if (gIsOnManully) ManuallyPosdMines(elCell, i, j)

    // RETURN if game if off
    if (!gGame.isOn) return
    // RETURN if player try to put flag on first press
    if (gGame.shownCount === 0 && evBtn === 2) return

    // when press is first and its not from puttong flag we Place the mines and count negs!
    if (gGame.shownCount === 0 && gGame.markedCount === 0 && gisInUndo === false) {

        if (!gIsOnManully && !gIsOn7Boom) placeTheMines(gLevel.mine, i, j) // placing the mine Randomly

        setMinesNegsCount(gBoard) // placeing the count of negs around
        printBoard(gBoard) // Render the board
        undoRecord() // Record the first Default board for Undo button
        //gCounterForUndo-- // To prevent counting duplicate.. happen only in first press
        gInitBoard = CopyMat(gBoard) // Global that keep the Original Board.
    }

    // Go to the hint button LOGIC
    if (gGame.isHint) return hintShow(i, j)

    // RETURN if the is open and its mine.. Ignore duplicate count.
    if (gBoard[i][j].isShown && gBoard[i][j].isMine) return
    // RETURN if the is open and its NUmber.. Ignore duplicate count.
    if (gBoard[i][j].isShown && gBoard[i][j].minesAroundCount > 0) return

    // Start the time when the game beggin
    gGame.secsPassed = (gGame.secsPassed) ? gGame.secsPassed : Date.now()
    gTimer = gGame.secsPassed
    // Hsow time every 50 mili
    gTimeInterval = setInterval(() => displayTimer(), 50);

    // if the player press the right mouse button we go to other Function hintShow()
    if (evBtn === 2) return cellMarked(elCell, i, j)

    // if the playes press on flag ewe ignore and put one less count.
    if (elCell.innerText === FLAG) { gGame.shownCount--; return }

    // if its MINE we lose but we have also 3 LIVES
    if (gBoard[i][j].isMine) {
        //Return the Func keepLiving that keep the player alive
        if (gGame.lives) return keepLiving(i, j)
        // Go to function the show all MINES
        showAllMines(i, j)
        // if the player have negs around him we show only the pressed cell
    } else if (gBoard[i][j].minesAroundCount > 0) {
        gGame.shownCount++
        console.log('minesAroundCount > 0 ', gGame.shownCount);
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount, 'showCell')
        // Record the step for Undo button
        undoRecord()
        // Check if game END.
        if (checkGameOver()) gGame.isOn = false
        // if we press on cell that not have negs so we need to open first degree negs.
    } else if (gBoard[i][j].minesAroundCount === 0) {
        if (gBoard[i][j].isShown) return
        gGame.shownCount++
        console.log('minesAroundCount === 0 ', gGame.shownCount);
        // Update Model
        gBoard[i][j].isShown = true
        // Update DOM
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount, 'showCell')

        var positions = getNeighbors(gBoard, i, j)
        showCellsAround(i, j, positions)
    }
}

// Marked cell with right mouse click with FLAG
function cellMarked(elCell, i, j) {

    if (elCell.innerText === WINDOW) {
        // Update Model
        gBoard[i][j].isMarked = true
        //Update DOM
        renderCell({ i: i, j: j }, FLAG, 'hideCell')

        gGame.markedCount++
        console.log('cellMarked:WINDOW ++', gGame.markedCount);

        // Record the step for Undo button
        undoRecord()
    }
    else {
        // Update Model
        gBoard[i][j].isMarked = false
        //Update DOM
        renderCell({ i: i, j: j }, WINDOW, 'hideCell')

        gGame.markedCount--
        console.log('cellMarked:else --', gGame.markedCount);

        // Record the step for Undo button
        undoRecord()
    }
    // Show in page the flags count
    displayFlagCount()
    // Check if game END.
    if (checkGameOver()) gGame.isOn = false
}

//show All Mines
function showAllMines(row, col) {
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (i === row && j === col) {
                // Update Model
                gBoard[i][j].isShown = true
                // Update DOM
                renderCell({ i: i, j: j }, EXPLODE, 'showCell')
            } else if (gBoard[i][j].isMarked) {
                gGame.shownCount++
                console.log('showAllMines:isMarked ', gGame.shownCount);

                // Update Model
                gBoard[i][j].isShown = true
                // Update DOM
                renderCell({ i: i, j: j }, FLAG_ON_MINE, 'showCell')
            } else if (gBoard[i][j].isMine) {
                gGame.shownCount++
                console.log('showAllMines:isMine ', gGame.shownCount);
                // Update Model
                gBoard[i][j].isShown = true
                // Update DOM
                renderCell({ i: i, j: j }, MINE, 'showCell')
            }
        }
    }
    return gameOver()
}

//Open First Degree cells // Recursion //
function showCellsAround(i, j, positions) {

    for (const pos of positions) {
        // IGNORE overRight cells the open allready or marked with flag.
        if (gBoard[pos.i][pos.j].isShown) continue
        if (gBoard[pos.i][pos.j].isMarked) continue
        gGame.shownCount++
        console.log('minesAroundCount === 0 Recursion', gGame.shownCount);
        // Update Model
        gBoard[pos.i][pos.j].isShown = true
        // Update DOM
        renderCell({ i: pos.i, j: pos.j }, gBoard[pos.i][pos.j].minesAroundCount, 'showCell')
    }

    var gCellsRecursion = []
    for (const pos of positions) {
        if (gBoard[pos.i][pos.j].minesAroundCount > 0) continue
        var cells = getNeighborsForRecursion(gBoard, pos.i, pos.j)
        if (!cells.length) continue
        for (let i = 0; i < cells.length; i++) {
            gCellsRecursion.push(cells[i])
        }
        console.log(gCellsRecursion);
    }

    if (gCellsRecursion.length) {
        showCellsAround(i, j, gCellsRecursion)
    } else {
        // Record the step for Undo button
        undoRecord()
        if (checkGameOver()) gGame.isOn = false
    }
}

// Keep the player live.
function keepLiving(i, j) {
    //Decrease one live
    gGame.lives--
    // counter
    gGame.shownCount++
    console.log('keepLiving ', gGame.shownCount);


    // Update Model
    gBoard[i][j].isShown = true
    // Update DOM
    renderCell({ i: i, j: j }, MINE, 'showCell')
    gElLivesCounter.innerText = 'Lives: ' + gGame.lives

    // Record the step for Undo button
    undoRecord()

    if (checkGameOver()) gGame.isOn = false
}

// come from onclick
function onClickHint() {
    // RETURN if we allreadt press HINT or didnt do first press or we out of hints!
    if (gGame.isHint) return
    if (!gGame.shownCount) return
    if (!gGame.hints) return

    gGame.isHint = true
    gGame.hints--

    //Update DOM
    gElHintsCounter.innerText = 'Hints: ' + gGame.hints
    gElButtonHint.style.background = 'yellow'
}

// find the cell to show
function hintShow(i, j) {
    // Get Cells
    var hintCells = getNeighbors(gBoard, i, j)

    hintCells.push({ i: i, j: j })

    for (const cell of hintCells) {
        if (gBoard[cell.i][cell.j].isShown) {
            continue
        } else if (gBoard[cell.i][cell.j].isMine) {
            renderCell({ i: cell.i, j: cell.j }, MINE, 'showCell')
        } else {
            renderCell({ i: cell.i, j: cell.j }, gBoard[cell.i][cell.j].minesAroundCount, 'showCell')
        }
    }
    setTimeout(() => {
        for (const cell of hintCells) {
            if (gBoard[cell.i][cell.j].isShown) {
                continue
            } else if (gBoard[cell.i][cell.j].isMine) {
                renderCell({ i: cell.i, j: cell.j }, WINDOW, 'hideCell')
            } else {
                renderCell({ i: cell.i, j: cell.j }, WINDOW, 'hideCell')
            }
        }
        gElButtonHint.style.background = ''
        gGame.isHint = false
    }, 1000);

}

// Get safe check logic
function onClickSafeCheck() {
    if (!gGame.safeCheck) return
    gGame.safeCheck--
    gElSafeCounter.innerText = 'Safe: ' + gGame.safeCheck

    var emptyCells = getEmptyCellsBoard(gBoard)
    var randomNum = getRandomInt(0, emptyCells.length)
    var randomCell = emptyCells[randomNum]
    renderCell({ i: randomCell.i, j: randomCell.j }, WINDOW, 'markCell')

    setTimeout(() => {
        renderCell({ i: randomCell.i, j: randomCell.j }, WINDOW, 'hideCell')
    }, 100);

}

// Check for WINS. // BAD LOGIC //
function checkGameOver() {
    if (gGame.shownCount === (gLevel.size ** 2 - gLevel.mine) && gGame.markedCount === gLevel.mine) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    } else if (gGame.shownCount === gLevel.size ** 2 && gGame.lives < LIVES) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    } else if ((gGame.shownCount + gGame.markedCount) === gLevel.size ** 2) {
        gElButton.innerText = WIN
        recordBestScore()
        return true
    }
    console.log('gGame.shownCount ', gGame.shownCount);
    console.log('gGame.markedCount ', gGame.markedCount);
    console.log('gGame.lives ', gGame.lives);
}

// If LOSE
function gameOver() {
    gGame.isOn = false
    gElButton.innerText = SAD
}

// Best score record LOGIC
function recordBestScore() {
    var elLevelSelected = document.querySelectorAll('input')

    if (!localStorage['Easy']) localStorage.setItem("Easy", Infinity)
    if (!localStorage['Hard']) localStorage.setItem("Hard", Infinity)
    if (!localStorage['Extream']) localStorage.setItem("Extream", Infinity)

    for (var i = 0; i < elLevelSelected.length; i++) {
        if (elLevelSelected[i].id === gCurrnetLevel) {
            var lastBestScore = +localStorage.getItem(gCurrnetLevel);
            if (+gTime < lastBestScore) localStorage.setItem(gCurrnetLevel, +gTime);
            return;
        }
    }
}

function undoRecord() {

    var copy = CopyMat(gBoard)
    gUndo.push(copy)

    gUndoProperties.push({
        isOn: gGame.isOn,
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        secsPassed: gGame.secsPassed,
        lives: gGame.lives,
        hints: gGame.hints,
        safeCheck: gGame.safeCheck,
        isHint: gGame.isHint
    })

    console.log('<<<<<< gUndo >>>>>>', gUndo);
    console.log('<<<<<< gUndoProperties >>>>>>', gUndoProperties);
}

function onClickUndo() {
    //debugger
    if (gUndo.length === 1) return
    if (gUndo.length === 2) return init()

    // for (let i = 0; i < gUndo.length; i++) {
    //     gUndo[0][i].minesAroundCount = 0
    //     gUndo[0][i].isShown = false
    //     gUndo[0][i].isMine = false
    //     gUndo[0][i].isMarked = false
    // }

    // gUndoProperties[0].isOn = true
    // gUndoProperties[0].shownCount = 0
    // gUndoProperties[0].markedCount = 0
    // gUndoProperties[0].secsPassed = gTimer
    // gUndoProperties[0].lives = 3
    // gUndoProperties[0].hints = 3
    // gUndoProperties[0].safeCheck = 3
    // gUndoProperties[0].isHint = false

    gUndo.splice(gUndo.length - 1, 1)
    gUndoProperties.splice(gUndo.length - 1, 1)

    gBoard = gUndo[gUndo.length - 1]

    renderBoardUndo(gBoard, '.board-container');

    gGame = gUndoProperties[gUndo.length - 1]
    displayTimer()
}
