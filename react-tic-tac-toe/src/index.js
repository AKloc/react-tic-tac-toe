import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

/*
class Square extends React.Component {
  render() {
    return (
      // COMMON MISTAKE: onClick={alert('click')} wouldn't get assigned
      // properly and would be called on every render. Use the ()s.
      <button className="square" onClick={() => this.props.onClick()}>
        {this.props.value}
      </button>
    );
  }
}
*/

// Defining the above using a function component instead of classes.
// Don't need to use "this.whatever" here, I guess? Also note that there
// aren't any parens when setting the onClick method on LHS or RHS.
function Square(props) {
  let btnStyle = {};

  if (props.winningSquare) {
    btnStyle = {
      fontWeight: "bold",
      color: "red",
    };
  }

  return (
    <button className="square" style={btnStyle} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function SetSortButton(props) {
  return <button onClick={props.onClick}>{props.value}</button>;
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      // The below is going to pass TWO values to Square's constructor.
      <Square
        value={this.props.squares[i]}
        winningSquare={
          this.props.winningSquares == null
            ? false
            : this.props.winningSquares.includes(i)
        }
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  // In JavaScript, always have to call "super" when defining the
  // constructor of a subclass (this is a subclass of React.Component).
  // React components with a constuctor should call super(props).
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      sortHistoryAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // .slice() with no parameters creates a copy of squares instead of
    // modifying the existing array. Why? Immutability.
    // 1: Avoiding direct data mutation lets us record histories
    // 2: Easier to detect changes. Don't have to scan each property
    //   to look for changes.
    // 3: MAIN BENEFIT: Lets you build PURE COMPONENTS in React -> FASTER.
    //   Immutable data is easy to detect changes which makes React
    //   faster.
    const squares = current.squares.slice();

    // Did someone already win the game? Is the square already filled?
    // If so, do nothing.
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    // If it's X's turn, show an X, otherwise show an O.
    squares[i] = this.state.xIsNext ? "X" : "O";

    // Why not just save the values directly and skip setstate?
    // Because setState queues changes and tells React to only re-render
    // This component and its children. It's the primary way to update
    // UIs in React.
    this.setState({
      history: history.concat([
        {
          squares: squares,
          indexOfSquareModified: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      let desc = move
        ? "Go to move #" +
          move +
          ". Modified square index: " +
          history[move].indexOfSquareModified
        : "Go to game start";

      let btnStyle = {};
      if (move === this.state.stepNumber) {
        btnStyle = {
          fontWeight: "bold",
        };
      }

      return (
        <li key={move}>
          <button style={btnStyle} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + current.squares[winner[0]];
    } else {
      if (history.length == 10) {
        status = "NO ONE WON. ARE YOU HAPPY NOW?";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    let setSortButtonOnClick = () =>
      this.setState({
        sortHistoryAscending: !this.state.sortHistoryAscending,
      });

    let setSortButton = (
      <SetSortButton
        value={this.state.sortHistoryAscending ? "Ascending" : "Descending"}
        onClick={setSortButtonOnClick}
      ></SetSortButton>
    );

    if (!this.state.sortHistoryAscending) {
      moves = moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winner}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{setSortButton}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // for each winning combination...
  for (let i = 0; i < lines.length; i++) {
    // set a, b, c equal to the three numbers in each winning combination...
    const [a, b, c] = lines[i];
    // this looks weird but it's checking for nulls. null is an object in
    // javascript that is falsy.
    // So - this is saying if A isn't null, and it's the same as b, and
    // it's the same as C, send back the winning O or X.
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  // No winner. Return nothing.
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
