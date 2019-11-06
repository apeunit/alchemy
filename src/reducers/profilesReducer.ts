import * as update from "immutability-helper";

import { AsyncActionSequence } from "actions/async";

export enum ActionTypes {
  GET_PROFILE_DATA = "GET_PROFILE_DATA",
  UPDATE_PROFILE = "UPDATE_PROFILE",
  FOLLOW_ITEM = "FOLLOW_ITEM"
}

export type FollowType = "daos" | "proposals" | "schemes" | "users";

export type IProfileState = {
  description: string;
  ethereumAccountAddress: string;
  follows: {
    daos: string[],
    proposals: string[],
    schemes: string[],
    users: string[]
  }
  image?: any;
  name: string;
  socialURLs: any;
};

export interface IProfilesState {
  [accountAddress: string]: IProfileState;
}

export function newProfile(ethereumAccountAddress: string): IProfileState {
  return {
    description: "",
    ethereumAccountAddress,
    follows: {
      daos: [],
      proposals: [],
      schemes: [],
      users: []
    },
    name: "",
    socialURLs: {},
  };
}

const initialState: IProfilesState = {};

const profilesReducer = (state = initialState, action: any) => {
  const { payload, meta } = action;

  switch (action.type) {

    case ActionTypes.UPDATE_PROFILE: {
      switch (action.sequence) {
        case AsyncActionSequence.Success:
          return update(state, { [meta.accountAddress]: (profile: any) => {
            return update(profile || newProfile(meta.accountAddress), { $merge: payload });
          }});
        default: {
          return state;
        }
      }
    }

    case ActionTypes.FOLLOW_ITEM: {
      switch (action.sequence) {
        case AsyncActionSequence.Success:
          const { type, id, isFollowing } = payload;

          if (!state[meta.accountAddress]) {
            state = update(state, { [meta.accountAddress]: { $set: newProfile(meta.accountAddress) }});
          }

          if (isFollowing && !state[meta.accountAddress].follows[type as FollowType].includes(id)) {
            return update(state, { [meta.accountAddress]: { follows: { [type]: { $push: [id] } }}});
          } else if (!isFollowing && state[meta.accountAddress].follows[type as FollowType].includes(id)) {
            return update(state, { [meta.accountAddress]: { follows: { [type]: { $unset: [id] } }}});
          }

        default: {
          return state;
        }
      }
    }

    case ActionTypes.GET_PROFILE_DATA: {
      switch (action.sequence) {
        case AsyncActionSequence.Success: {
          const { profiles } = payload;

          for (const address of Object.keys(profiles)) {
            state = update(state, { [address]: { $set: profiles[address] } });
          }
          return state;
        }
        case AsyncActionSequence.Failure: {
          // eslint-disable-next-line no-console
          console.error(`ERROR: ${payload}`);
          return state;
        }
      }
    }
      break;

    default: {
      return state;
    }
  }
};

export default profilesReducer;
