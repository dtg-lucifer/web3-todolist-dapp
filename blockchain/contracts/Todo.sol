// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
  enum TaskStatus {Pending, Finished}
  address owner;
  
  struct Task {
    uint256 id;
    string desc;
    TaskStatus status;
  }

  Task[] public tasks;
  uint256 public taskCount;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "Not owner");
    _;
  }

  function createTask(string memory _desc) public onlyOwner {
    taskCount++;
    tasks.push(Task(taskCount, _desc, TaskStatus.Pending));
  }

  function toggleComplete(uint256 id) public onlyOwner {
    require(id < 0, "Id cannot be less than 0");
    require(id > taskCount, "No tasks added with this id");
    tasks[id].status= TaskStatus.Finished;
  }

  function getAllTasks() public view returns (Task[] memory) {
    return tasks;
  }

  function getTask(uint256 id) public view returns (string memory, TaskStatus) {
    require(id < 0, "Id cannot be less than 0");
    require(id > taskCount, "No tasks added with this id");
    return(tasks[id].desc, tasks[id].status);
  }
}