import { StatusCode } from './util/statusCode';

export interface BluetoothState {
  isLoading: boolean;
  device?: BluetoothDeviceState;
}

export interface BluetoothDeviceState {
  battery?: number;
  name: string;
  status?: StatusCode;
  uploadProgress?: number;
}

export interface GraphState {
  isLoading: boolean;
  me?: GraphMeState;
  activity?: GraphActivityState;
}

export interface GraphMeState {
  username: string;
  name: string;
  email: string;
}

export interface GraphActivityState {
  current: PresenceActivity;
}

export type PresenceActivity =
  | 'Available'
  | 'Away'
  | 'BeRightBack'
  | 'Busy'
  | 'DoNotDisturb'
  | 'InACall'
  | 'InAConferenceCall'
  | 'Inactive'
  | 'InAMeeting'
  | 'Offline'
  | 'OffWork'
  | 'OutOfOffice'
  | 'PresenceUnknown'
  | 'Presenting'
  | 'UrgentInterruptionsOnly';

export const mapActivityToStatusCode = (
  activity: PresenceActivity,
): StatusCode => {
  switch (activity) {
    case 'Away':
    case 'Available':
    case 'Inactive':
      return StatusCode.STATUS_AVAILABLE;
    case 'BeRightBack':
      return StatusCode.STATUS_BRB;
    case 'Busy':
      return StatusCode.STATUS_BUSY;
    case 'DoNotDisturb':
    case 'UrgentInterruptionsOnly':
      return StatusCode.STATUS_DND;
    case 'InACall':
    case 'InAConferenceCall':
    case 'InAMeeting':
    case 'Presenting':
      return StatusCode.STATUS_MEETING;
    case 'Offline':
    case 'OffWork':
      return StatusCode.STATUS_OFFLINE;
    case 'OutOfOffice':
      return StatusCode.STATUS_OOO;
    case 'PresenceUnknown':
    default: {
      return StatusCode.STATUS_UNKNOWN;
    }
  }
};
