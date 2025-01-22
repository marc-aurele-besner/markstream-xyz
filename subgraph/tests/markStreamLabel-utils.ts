import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  LabelAdded,
  LabelDownVoted,
  LabelRemoved,
  LabelUpVoted,
  OwnerChanged,
} from "../generated/MarkStreamLabel/MarkStreamLabel";

export function createLabelAddedEvent(
  contributor: Address,
  labelId: BigInt,
  description: string
): LabelAdded {
  let labelAddedEvent = changetype<LabelAdded>(newMockEvent());
  labelAddedEvent.parameters = new Array();

  labelAddedEvent.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(contributor)
    )
  );
  labelAddedEvent.parameters.push(
    new ethereum.EventParam("label", ethereum.Value.fromUnsignedBigInt(labelId))
  );
  labelAddedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  );

  return labelAddedEvent;
}

export function createLabelRemovedEvent(
  contributor: Address,
  labelId: BigInt
): LabelRemoved {
  let labelRemovedEvent = changetype<LabelRemoved>(newMockEvent());
  labelRemovedEvent.parameters = new Array();

  labelRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(contributor)
    )
  );
  labelRemovedEvent.parameters.push(
    new ethereum.EventParam("label", ethereum.Value.fromUnsignedBigInt(labelId))
  );

  return labelRemovedEvent;
}

export function createLabelUpVotedEvent(
  contributor: Address,
  labelId: BigInt,
  fileHash: BigInt
): LabelUpVoted {
  let labelUpVotedEvent = changetype<LabelUpVoted>(newMockEvent());
  labelUpVotedEvent.parameters = new Array();

  labelUpVotedEvent.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(contributor)
    )
  );
  labelUpVotedEvent.parameters.push(
    new ethereum.EventParam("label", ethereum.Value.fromUnsignedBigInt(labelId))
  );
  labelUpVotedEvent.parameters.push(
    new ethereum.EventParam(
      "fileHash",
      ethereum.Value.fromUnsignedBigInt(fileHash)
    )
  );

  return labelUpVotedEvent;
}

export function createLabelDownVotedEvent(
  contributor: Address,
  labelId: BigInt,
  fileHash: BigInt
): LabelDownVoted {
  let labelDownVotedEvent = changetype<LabelDownVoted>(newMockEvent());
  labelDownVotedEvent.parameters = new Array();

  labelDownVotedEvent.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(contributor)
    )
  );
  labelDownVotedEvent.parameters.push(
    new ethereum.EventParam("label", ethereum.Value.fromUnsignedBigInt(labelId))
  );
  labelDownVotedEvent.parameters.push(
    new ethereum.EventParam(
      "fileHash",
      ethereum.Value.fromUnsignedBigInt(fileHash)
    )
  );

  return labelDownVotedEvent;
}

export function createOwnerChangedEvent(newOwner: Address): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent());
  ownerChangedEvent.parameters = new Array();

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  );

  return ownerChangedEvent;
}
