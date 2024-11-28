import { redisClient } from '../redisClient';
import crypto from 'crypto';
import {State} from '../../sim/state';
import {RoomBattle, RoomBattleStream} from '../room-battle';
import type {RoomBattleOptions} from '../room-battle';
import {Battle} from '../../sim';

export function assertIsInstance(obj: any, className: Function) {
	if (!(obj instanceof className)) {
	  throw new Error(`Object is not an instance of ${className.name}`);
	}
  }

// given a room, get the serialized battle state
export function getBattleStream(room: Room) {
    assertIsInstance(room.battle, RoomBattle);
    assertIsInstance(room.battle?.stream, RoomBattleStream);
    return room.battle?.stream;
}

// given a room, get the serialized battle state
export function getBattleState(room: Room) {
    assertIsInstance(room.battle, RoomBattle);
    assertIsInstance(room.battle?.stream, RoomBattleStream);
    assertIsInstance(room.battle?.stream.battle, Battle);
    return State.serializeBattle(room.battle?.stream.battle);
}

// get battle state hash
export function getBattleStateHash(serializedBattle: AnyObject) {
    return crypto.createHash('sha256').update(JSON.stringify(serializedBattle)).digest('hex');
}

// add state hash: state pair to redis
export async function addHashStatePairToRedis(stateHash: string, state: AnyObject) {
    redisClient.set(stateHash, JSON.stringify(state));
}

// get state hash: state pair from redis
export async function getSerializedBattleStateFromRedis(stateHash: string) {
    const serializedStateString = await redisClient.get(stateHash);
    if (serializedStateString) {
        return JSON.parse(serializedStateString);
    }
    else if (serializedStateString === null) {
        throw new Error('State not found in Redis');
    } 
    else {
        throw new Error(serializedStateString);
    }
}