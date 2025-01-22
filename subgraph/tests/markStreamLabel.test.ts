import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  afterAll,
  assert,
  beforeAll,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { handleLabelAdded, handleLabelUpVoted } from "../src/markStreamLabel";
import {
  createLabelAddedEvent,
  createLabelDownVotedEvent,
  createLabelRemovedEvent,
  createLabelUpVotedEvent,
  createOwnerChangedEvent,
} from "./markStreamLabel-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Label Events", () => {
  beforeAll(() => {
    clearStore();
  });

  afterAll(() => {
    clearStore();
  });

  test("Can handle label added event", () => {
    const contributor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const labelId = BigInt.fromI32(1);
    const description = "Test Label";

    const event = createLabelAddedEvent(contributor, labelId, description);
    handleLabelAdded(event);

    assert.entityCount("LabelAdded", 1);
    assert.entityCount("Label", 1);

    // Check Label entity
    assert.fieldEquals("Label", labelId.toString(), "status", "active");
    assert.fieldEquals(
      "Label",
      labelId.toString(),
      "creator",
      contributor.toHexString()
    );
  });

  test("Can handle label upvote event", () => {
    const contributor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    const labelId = BigInt.fromI32(1);
    const fileHash = BigInt.fromI32(123);

    const event = createLabelUpVotedEvent(contributor, labelId, fileHash);
    handleLabelUpVoted(event);

    assert.entityCount("LabelUpVoted", 1);
    assert.entityCount("File", 1);
    assert.entityCount("FileLabel", 1);

    const fileLabelId = fileHash
      .toString()
      .concat("-")
      .concat(labelId.toString());

    // Check FileLabel entity
    assert.fieldEquals("FileLabel", fileLabelId, "totalUpVotes", "1");
    assert.fieldEquals("FileLabel", fileLabelId, "totalContributions", "1");
  });
});
