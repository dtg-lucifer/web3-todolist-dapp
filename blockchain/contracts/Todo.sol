// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
  struct Task {
    uint256 id;
    string content;
    bool completed;
  }

  mapping(uint256 => Task) public tasks;
  uint256 public taskCount;

  event TaskCreated(uint256 id, string content, bool completed);
  event TaskCompleted(uint256 id, bool completed);

  function createTask(string memory _content) public {
    tasks[taskCount] = Task(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false);
    taskCount++;
  }

  function toggleComplete(uint256 _id) public {
    Task storage task = tasks[_id];
    task.completed = !task.completed;
    emit TaskCompleted(_id, task.completed);
  }
}
