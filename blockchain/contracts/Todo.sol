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
    require(bytes(_content).length > 0, "Task content cannot be empty");
    tasks[taskCount] = Task(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false);
    taskCount++;
  }

  function toggleComplete(uint256 _id) public {
    require(_id < taskCount, "Task ID does not exist");
    Task storage task = tasks[_id];
    task.completed = !task.completed;
    emit TaskCompleted(_id, task.completed);
  }

  function getAllTasks() public view returns (Task[] memory) {
    Task[] memory allTasks = new Task[](taskCount);
    for (uint256 i = 0; i < taskCount; i++) {
        Task storage task = tasks[i];
        allTasks[i] = task;
    }
    return allTasks;
  }
}
