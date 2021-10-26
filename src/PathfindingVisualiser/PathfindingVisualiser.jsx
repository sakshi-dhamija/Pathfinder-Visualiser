import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';
import './PathfindingVisualiser.css';

export default class PathfindingVisualiser extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      speed: "avg",
      START_NODE_ROW : 10,
      START_NODE_COL : 15,
      FINISH_NODE_ROW : 10,
      FINISH_NODE_COL : 35,
      changingStart: false,
      changingFinish : false,
      locked : false

    };
  }

  componentDidMount() {
    const {START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL} = this.state;
    const grid = getInitialGrid(START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL);
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const {START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL} = this.state;
    if(row===START_NODE_ROW && col===START_NODE_COL){
      console.log("start");
      this.setState({changingStart:true, mouseIsPressed: true}, ()=> console.log(this.state));
    }
    else if(row===FINISH_NODE_ROW && col===FINISH_NODE_COL){
      this.setState({changingFinish:true, mouseIsPressed: true});
    }
    else{
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
    
  }

  handleMouseEnter(row, col) {
    const {changingStart, changingFinish, START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL, grid} = this.state;

    if (!this.state.mouseIsPressed) return;

    if(changingStart){
      const newStartGrid = getNewGridWithStartChanged(grid, row, col, START_NODE_ROW, START_NODE_COL);
      this.setState({grid: newStartGrid, START_NODE_ROW : row, START_NODE_COL : col}, ()=> console.log(this.state));
    }

    else if(changingFinish){
      const newFinishGrid = getNewGridWithFinishChanged(grid, row, col, FINISH_NODE_ROW, FINISH_NODE_COL);
      this.setState({grid: newFinishGrid, FINISH_NODE_ROW : row, FINISH_NODE_COL : col});
    }
    else{
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid});
    }
  }

  handleMouseUp() {
    const {changingStart, changingFinish} =this.state;
    this.setState({mouseIsPressed: false});

    if(changingStart)
      this.setState({changingStart:false});
    if(changingFinish)
      this.setState({changingFinish:false});
  }


  handleSpeedChange = (e) => {
    this.setState({speed:e.target.value})
  };


  lockGrid(){
    this.setState({locked: true});
  };

  unLockGrid(){
    this.setState({locked: false});
  }
  
  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    const {speed} = this.state;
    var n = 10;
    speed === 'avg' ? n=10 : speed === "fast" ? n=3 : n=25;
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, n * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];

        if (!node.isStart && !node.isFinish) {
           document.getElementById(`node-${node.row}-${node.col}`).className =
             'node node-visited';    
        }
      }, n * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {

    const {speed} = this.state;
    var n = 50;
    speed === 'avg' ? n=50 : speed === "fast" ? n=25 : n=70;
    
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {    
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
           document.getElementById(`node-${node.row}-${node.col}`).className =
             'node node-shortest-path';  
        }
        if(i === nodesInShortestPathOrder.length-1) this.unLockGrid(); // make it possible again to change, clear grid
      }, 50 * i);

    }
  }

  visualizeDijkstra() {
    const {grid, START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    this.lockGrid(); // make it impossible to change in grid until finishing visualizing
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  clearGrid(){
    if (this.state.locked) return;
    const {grid, START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL} = this.state;
    const newGrid = getInitialGrid(START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL);
    this.setState({grid: newGrid});
    for(let row=0;row<grid.length;row++){
      for(let col=0;col<grid[row].length;col++){
        if(row === START_NODE_ROW && col === START_NODE_COL){
          document.getElementById(`node-${row}-${col}`).className ='node node-start';
          continue;
        }
        if(row === FINISH_NODE_ROW && col === FINISH_NODE_COL){
          document.getElementById(`node-${row}-${col}`).className ='node node-finish';
          continue;
        }
        document.getElementById(`node-${row}-${col}`).className ='node';
      }
    }
  }
  //We take the value of the option element when a button is clicked and then compare it with 
  //the string values of all the algorithms we would implement. When an algorithm 
  //matches, its function (like this.visualizeDijkstra()) is called
    chooseAlgorithm(){
      const algorithm = document.getElementById("algos").value;
      if(algorithm === "Dijkstra"){
        this.visualizeDijkstra();
      }
      else if(algorithm === "Algo2"){
        alert("Algorithm 2 hasn't been implemented yet");
      }
      else if(algorithm === "Algo3"){
        alert("Algorithm 3 hasn't been implemented yet");
      }
  }


  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        {/* Dropdown menu to select algorithm*/}
        <div className = "dropDown">
          <select id="algos">
            <option value="notAlgo">
               Select an algorithm
            </option>
            <option value="Dijkstra">
                Dijkstra Algorithm
            </option>
            <option value="Algo2">
                Algorithm 2
            </option>
            <option value="Algo3">
                Algorithm 3
            </option>
          </select>
          <button onClick={() => this.chooseAlgorithm()}>
                Visualize
          </button>
        </div>

        {/* Dropdown menu to select speed */}
        
        <div className="speed">
          <label for="speed">Choose a Speed: </label>
          <select 
          name="speed"
          value={this.state.speed} 
          onChange={this.handleSpeedChange}
          >
            <option value="slow">Slow</option>
            <option value="avg">Average</option>
            <option value="fast">Fast</option>
          </select>
        </div>

        <button disabled = {this.state.locked} onClick={() => this.clearGrid()}>
          Clear Grid
        </button>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = (start_row, start_col, finish_row, finish_col) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row, start_row, start_col, finish_row, finish_col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, start_row, start_col, finish_row, finish_col) => {
  return {
    col,
    row,
    isStart: row === start_row && col === start_col,
    isFinish: row === finish_row && col === finish_col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithStartChanged = (grid, start_row, start_col, old_start_row, old_start_col) => {
  const newGrid = grid.slice();
  const newNode = newGrid[start_row][start_col];
  const oldNode = newGrid[old_start_row][old_start_col];
  const newStartNode = {
    ...newNode,
    isStart: true,
  };
  const oldStartNode = {
    ...oldNode,
    isStart: false,
  };
  newGrid[start_row][start_col] = newStartNode;
  newGrid[old_start_row][old_start_col] = oldStartNode;
  return newGrid;
}

const getNewGridWithFinishChanged = (grid, finish_row, finish_col, old_finish_row, old_finish_col) => {
  const newGrid = grid.slice();
  const newNode = newGrid[finish_row][finish_col];
  const oldNode = newGrid[old_finish_row][old_finish_col];
  const newFinishNode = {
    ...newNode,
    isFinish: true,
  };
  const oldFinishNode = {
    ...oldNode,
    isFinish: false,
  };
  newGrid[finish_row][finish_col] = newFinishNode;
  newGrid[old_finish_row][old_finish_col] = oldFinishNode;
  return newGrid;
}