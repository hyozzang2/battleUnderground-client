import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';

import * as socketActions from '../actions/socket';
import TicTacToe from './games/Tic-Tac-Toe';

export default GameContainer = ({ user, room, participants, navigation }) => {
  const dispatch = useDispatch();

  const id = useSelector(state => state.user.id);
  const winner = useSelector(state => state.socket.winner);
  const station = useSelector(state => state.subway.train);
  const gameScore = useSelector(state => state.socket.gameScore);
  const gameStatus = useSelector(state => state.socket.gameStatus);
  const selectedBoxes = useSelector(state => state.socket.selectedBoxes);

  const [ turn, setTurn ] = useState(null);
  const [ opponent, setOpponent ] = useState(null);
  const [ startSign, setStartSign ] = useState(true);

  const isUserTurn = (participants, user) => {
    const isTurn = { 0: true, 1: false };

    participants.forEach((participant, idx) => {
      if (user === participant.name) {
        setTurn(isTurn[idx]);
      } else {
        setOpponent(participant.name);
      }
    })
    return turn;
  }

  useEffect(() => {
    const InitialInfo = {
      name: user,
      turn: isUserTurn(participants, user),
      selectedBoxes: [],
      selectBox: null,
      winner: null,
      score: null,
      station,
      room
    };
    dispatch(socketActions.dispatchUserInitialInfo(InitialInfo));
    setTimeout(() => {
      setStartSign(false);
    }, 3000);
  }, []);

  const receiveGameStatus = useCallback((room) => {
    dispatch(socketActions.receiveGameStatus(room));
  })

  const updateGameInfo = useCallback((info) => {
    dispatch(socketActions.updateGameInfo(info));
  })

  const dispatchGameResult = useCallback((room, result, user) => {
    dispatch(socketActions.dispatchGameResult(room, result, user, id, gameScore));
  })

  const socketOff = useCallback((event) => {
    dispatch(socketActions.socketOff(event));
  })

  return (
    <View style={styles.container}>
      {
        startSign
        ? <View style={styles.ready}>
          <Text style={styles.firstTurn}>
            {`${turn ? user : opponent }'s turn`}
          </Text>
          <Text style={styles.secondTurn}>
            {`next is ${turn ? opponent : user}`}
          </Text>
          <Text style={styles.description}>
            {`The player who succeeds\nin placing three of their Pokemon\nin a horizontal, vertical,\nor diagonal row is the winner`}
          </Text>
        </View>
        : <View style={styles.mainSection}>
          <TicTacToe
            style={styles.game}
            id={id}
            user={user}
            room={room}
            winner={winner}
            initialTurn={turn}
            opponent={opponent}
            socketOff={socketOff}
            gameScore={gameScore}
            gameStatus={gameStatus}
            navigation={navigation}
            selectedBoxes={selectedBoxes}
            updateGameInfo={updateGameInfo}
            receiveGameStatus={receiveGameStatus}
            dispatchGameResult={dispatchGameResult}
          />
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#dddddd',
    width: '98%'
  },
  mainSection: {
    flexDirection: 'column'
  },
  firstTurn : {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'dunggeunmo',
    color: 'red'
  },
  secondTurn: {
    fontSize: 15,
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'dunggeunmo',
  },
  ready: {
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'black',
    borderStyle: 'solid',
    width: '100%',
    height: '95%',
    backgroundColor: 'white',
  },
  description: {
    fontSize: 20,
    marginTop: 30,
    textAlign: 'center',
    fontFamily: 'dunggeunmo',
  }
});