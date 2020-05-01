import * as socketActions from '../actions/socket';
import * as types from '../constants/index'
import getEnvVars from '../environment';
import io from 'socket.io-client';

const { HOST_URL } = getEnvVars();

const socketMiddleware = () => {
  let socket = null;

  return store => next => action => {
    switch (action.type) {
      case types.SOCKET_CONNECT:
        if (socket !== null) {
          socket.close();
        }

        socket = io(HOST_URL);
        socket.emit('connected', action.train);

        break;
      case types.SOCKET_JOIN:
        const joinInfo = {
          train: action.train,
          nickname: action.nickname,
        };

        socket.emit('joinRoom', joinInfo);
        socket.on('joined', (participants, room) => {
          store.dispatch(socketActions.dispatchParticipants(participants));
          store.dispatch(socketActions.dispatchRoom(room));
        })

        break;
      case types.DISPATCH_READY_USERS:
        const userInfo = {
          train: action.train,
          nickname: action.nickname
        };

        socket.emit('onReady', userInfo, action.room);
        socket.on('readyStatus', (userStatus) => {
          store.dispatch(socketActions.dispatchUserStatus(userStatus));
        })

        break;
      case types.DISPATCH_USER_INITIAL_INFO:
        socket.emit('initialInfo', action.initialInfo)

        break;
      case types.DISPATCH_MESSAGE:
        console.log(action.messageInfo)
        socket.emit('message', action.room, action.messageInfo);
        socket.on('messageList', (chat) => {
          store.dispatch(socketActions.dispatchChatList(chat));
        })
        break;
      case types.SOCKET_DISCONNECTED:
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        console.log('socket closed');
        break;
      default:
        return next(action);
    }
  };
};

export default socketMiddleware();
