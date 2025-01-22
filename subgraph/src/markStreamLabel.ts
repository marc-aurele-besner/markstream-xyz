import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  LabelAdded as LabelAddedEvent,
  LabelDownVoted as LabelDownVotedEvent,
  LabelRemoved as LabelRemovedEvent,
  LabelUpVoted as LabelUpVotedEvent,
  OwnerChanged as OwnerChangedEvent,
} from "../generated/MarkStreamLabel/MarkStreamLabel";
import {
  File,
  FileLabel,
  Label,
  LabelAdded,
  LabelDownVoted,
  LabelRemoved,
  LabelUpVoted,
  OwnerChanged,
} from "../generated/schema";

export function handleLabelAdded(event: LabelAddedEvent): void {
  // Create immutable event entity
  let labelAdded = new LabelAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  labelAdded.contributor = event.params.contributor;
  labelAdded.labelId = event.params.label;
  labelAdded.description = event.params.description;
  labelAdded.blockNumber = event.block.number;
  labelAdded.blockTimestamp = event.block.timestamp;
  labelAdded.transactionHash = event.transaction.hash;
  labelAdded.save();

  // Create or update mutable Label entity
  const labelId = Bytes.fromHexString(event.params.label.toString());
  let label = Label.load(labelId);
  if (label == null) {
    label = new Label(labelId);
    label.creator = event.params.contributor;
    label.status = "active";
    label.totalContributions = BigInt.fromI32(0);
    label.blockNumber = event.block.number;
    label.blockTimestamp = event.block.timestamp;
    label.transactionHash = event.transaction.hash;
    label.save();
  }
}

export function handleLabelRemoved(event: LabelRemovedEvent): void {
  // Create immutable event entity
  let labelRemoved = new LabelRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  labelRemoved.contributor = event.params.contributor;
  labelRemoved.labelId = event.params.label;
  labelRemoved.blockNumber = event.block.number;
  labelRemoved.blockTimestamp = event.block.timestamp;
  labelRemoved.transactionHash = event.transaction.hash;
  labelRemoved.save();

  // Update mutable Label entity
  const labelId = Bytes.fromHexString(event.params.label.toString());
  let label = Label.load(labelId);
  if (label != null) {
    label.status = "deleted";
    label.save();
  }
}

export function handleLabelUpVoted(event: LabelUpVotedEvent): void {
  // Create immutable event entity
  let labelUpVoted = new LabelUpVoted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  labelUpVoted.contributor = event.params.contributor;
  labelUpVoted.labelId = event.params.label;
  labelUpVoted.fileHash = event.params.fileHash;
  labelUpVoted.blockNumber = event.block.number;
  labelUpVoted.blockTimestamp = event.block.timestamp;
  labelUpVoted.transactionHash = event.transaction.hash;
  labelUpVoted.save();

  // Update or create File entity
  const fileHash = Bytes.fromHexString(event.params.fileHash.toString());
  let file = File.load(fileHash);
  if (file == null) {
    file = new File(fileHash);
    file.totalLabels = BigInt.fromI32(0);
    file.totalContributions = BigInt.fromI32(0);
    file.blockNumber = event.block.number;
    file.blockTimestamp = event.block.timestamp;
    file.transactionHash = event.transaction.hash;
  }
  file.totalContributions = file.totalContributions.plus(BigInt.fromI32(1));
  file.save();

  // Update or create FileLabel entity
  let fileLabelId = Bytes.fromHexString(
    event.params.fileHash
      .toString()
      .concat("-")
      .concat(event.params.label.toString())
  );
  let fileLabel = FileLabel.load(fileLabelId);
  if (fileLabel == null) {
    fileLabel = new FileLabel(fileLabelId);
    fileLabel.fileId = event.params.fileHash;
    fileLabel.labelId = event.params.label;
    fileLabel.totalContributions = BigInt.fromI32(0);
    fileLabel.totalUpVotes = BigInt.fromI32(0);
    fileLabel.totalDownVotes = BigInt.fromI32(0);
    fileLabel.blockNumber = event.block.number;
    fileLabel.blockTimestamp = event.block.timestamp;
    fileLabel.transactionHash = event.transaction.hash;
  }
  fileLabel.totalUpVotes = fileLabel.totalUpVotes.plus(BigInt.fromI32(1));
  fileLabel.totalContributions = fileLabel.totalContributions.plus(
    BigInt.fromI32(1)
  );
  fileLabel.save();
}

export function handleLabelDownVoted(event: LabelDownVotedEvent): void {
  // Create immutable event entity
  let labelDownVoted = new LabelDownVoted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  labelDownVoted.contributor = event.params.contributor;
  labelDownVoted.labelId = event.params.label;
  labelDownVoted.fileHash = event.params.fileHash;
  labelDownVoted.blockNumber = event.block.number;
  labelDownVoted.blockTimestamp = event.block.timestamp;
  labelDownVoted.transactionHash = event.transaction.hash;
  labelDownVoted.save();

  // Update or create File entity
  const fileHash = Bytes.fromHexString(event.params.fileHash.toString());
  let file = File.load(fileHash);
  if (file == null) {
    file = new File(fileHash);
    file.totalLabels = BigInt.fromI32(0);
    file.totalContributions = BigInt.fromI32(0);
    file.blockNumber = event.block.number;
    file.blockTimestamp = event.block.timestamp;
    file.transactionHash = event.transaction.hash;
  }
  file.totalContributions = file.totalContributions.plus(BigInt.fromI32(1));
  file.save();

  // Update or create FileLabel entity
  let fileLabelId = Bytes.fromHexString(
    event.params.fileHash
      .toString()
      .concat("-")
      .concat(event.params.label.toString())
  );
  let fileLabel = FileLabel.load(fileLabelId);
  if (fileLabel == null) {
    fileLabel = new FileLabel(fileLabelId);
    fileLabel.fileId = event.params.fileHash;
    fileLabel.labelId = event.params.label;
    fileLabel.totalContributions = BigInt.fromI32(0);
    fileLabel.totalUpVotes = BigInt.fromI32(0);
    fileLabel.totalDownVotes = BigInt.fromI32(0);
    fileLabel.blockNumber = event.block.number;
    fileLabel.blockTimestamp = event.block.timestamp;
    fileLabel.transactionHash = event.transaction.hash;
  }
  fileLabel.totalDownVotes = fileLabel.totalDownVotes.plus(BigInt.fromI32(1));
  fileLabel.totalContributions = fileLabel.totalContributions.plus(
    BigInt.fromI32(1)
  );
  fileLabel.save();
}

export function handleOwnerChanged(event: OwnerChangedEvent): void {
  let ownerChanged = new OwnerChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  ownerChanged.owner = event.params.newOwner;
  ownerChanged.blockNumber = event.block.number;
  ownerChanged.blockTimestamp = event.block.timestamp;
  ownerChanged.transactionHash = event.transaction.hash;
  ownerChanged.save();
}
