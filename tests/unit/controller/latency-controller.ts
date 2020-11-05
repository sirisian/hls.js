/* eslint-disable dot-notation */
import LatencyController from '../../../src/controller/latency-controller';
import Hls from '../../../src/hls';
import { Events } from '../../../src/events';
import LevelDetails from '../../../src/loader/level-details';
import { LevelUpdatedData } from '../../../src/types/events';

import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
const expect = chai.expect;

describe('LatencyController', function () {
  let hls: Hls;
  let latencyController: LatencyController;
  let levelDetails: LevelDetails;
  let levelEdgeStub;
  let levelAgeStub;
  let levelUpdatedData: LevelUpdatedData;
  let media: { currentTime: number, playbackRate: number };

  function updateCurrentTime (value: number) {
    media.currentTime = value;
    latencyController['timeupdate']();
  }

  function updatePlaylistEdge (value: number) {
    levelEdgeStub.get(() => value);
    latencyController['timeupdate']();
  }

  function updatePlaylistAge (value: number) {
    levelAgeStub.get(() => value);
    latencyController['timeupdate']();
  }

  beforeEach(function () {
    hls = new Hls({});
    latencyController = new LatencyController(hls);
    levelDetails = new LevelDetails('');
    levelDetails.live = true;
    levelDetails.targetduration = 5;
    levelEdgeStub = sinon.stub(levelDetails, 'edge');
    levelEdgeStub.get(() => 0);
    levelAgeStub = sinon.stub(levelDetails, 'age');
    levelAgeStub.get(() => 0);
    levelUpdatedData = {
      details: levelDetails,
      level: 0
    };
    // @ts-ignore
    media = latencyController['media'] = {
      currentTime: 0,
      playbackRate: 1
    };
  });

  describe('latency', function () {
    it('returns 0 when unknown / detached / prior to timeupdate', function () {
      expect(latencyController.latency).to.equal(0);
    });

    it('is the distance between currentTime and the live edge plus playlist age', function () {
      latencyController['onLevelUpdated'](Events.LEVEL_UPDATED, levelUpdatedData);
      updatePlaylistEdge(25);
      expect(latencyController.latency).to.equal(25);
      updateCurrentTime(15);
      expect(latencyController.latency).to.equal(10);
      updateCurrentTime(20);
      expect(latencyController.latency).to.equal(5);
      updatePlaylistAge(1);
      expect(latencyController.latency).to.equal(6);
      updatePlaylistEdge(30);
      updatePlaylistAge(0);
      expect(latencyController.latency).to.equal(10);
    });
  });

  describe('maxLatency', function () {
    it('returns liveMaxLatencyDuration when set', function () {
      latencyController['config'].liveMaxLatencyDuration = 30;
      expect(latencyController.maxLatency).to.equal(30);
    });

    it('returns liveMaxLatencyDurationCount * targetduration after level update', function () {
      latencyController['config'].liveMaxLatencyDurationCount = 3;
      expect(latencyController.maxLatency).to.equal(0);
      latencyController['onLevelUpdated'](Events.LEVEL_UPDATED, levelUpdatedData);
      expect(latencyController.maxLatency).to.equal(15);
    });
  });

  describe('targetLatency', function () {

  });

  describe('liveSyncPosition', function () {

  });

  describe('edgeStalled', function () {

  });

  it('increases targetLatency after a BUFFER_STALLED_ERROR', function () {

  });

  it('increases playbackRate when latency is greater than target latency', function () {

  });

  it('decreases playbackRate when latency is less than target latency', function () {

  });

  it('decreases playbackRate when playback is at risk of stalling', function () {

  });

  it('resets latency estimates when a new manifest is loaded', function () {

  });
});
