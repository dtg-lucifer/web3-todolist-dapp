import type { Route } from "./+types/home";
import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import TodoListABI from "../../abi/todolist.abi.json";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

interface Task {
  id: number;
  content: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    const loadProviderAndContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const web3Provider = new BrowserProvider(window.ethereum);
          const signer = await web3Provider.getSigner();
          const todoContract = new Contract(
            import.meta.env.VITE_CONTRACT_ADDRESS,
            TodoListABI,
            signer
          );

          setProvider(web3Provider);
          setContract(todoContract);

          const taskCount = await todoContract.taskCount();
          const loadedTasks: Task[] = [];
          for (let i = 0; i < taskCount.toNumber(); i++) {
            const task = await todoContract.tasks(i);
            loadedTasks.push({
              id: task.id.toNumber(),
              content: task.content,
              completed: task.completed,
            });
          }
          setTasks(loadedTasks);
        } catch (error) {
          console.error("Error loading provider or contract:", error);
        }
      } else {
        alert("Please install Metamask!");
      }
    };

    loadProviderAndContract();
  }, []);

  const addTask = async () => {
    if (!provider || !contract) {
      console.error("Provider or contract is not initialized");
      return;
    }

    try {
      // Get the sender's account
      const accounts = await provider.send("eth_requestAccounts", []);
      const sender = accounts[0];

      // Get the current nonce for the sender's account
      const nonce = await provider.send("eth_getTransactionCount", [
        sender,
        "latest", // Use "latest" to get the current nonce
      ]);

      // Send the transaction with the nonce
      const tx = await provider.send("eth_sendTransaction", [
        {
          from: sender,
          to: import.meta.env.VITE_CONTRACT_ADDRESS,
          nonce, // Explicitly set the nonce
          data: contract.interface.encodeFunctionData("createTask", [newTask]),
        },
      ]);

      // Wait for the transaction to be mined
      console.log("Transaction sent:", tx);
      setNewTask(""); // Clear the input after sending the transaction

      // Reload tasks (optional, to reflect changes immediately)
      const taskCount = await contract.taskCount();
      const loadedTasks: Task[] = [];
      for (let i = 0; i < taskCount; i++) {
        const task = await contract.tasks(i);
        loadedTasks.push({
          id: task.id.toNumber(),
          content: task.content,
          completed: task.completed,
        });
      }
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    if (contract) {
      try {
        const tx = await contract.toggleComplete(id);
        await tx.wait(); // Wait for the transaction to be mined
      } catch (error) {
        console.error("Error toggling task completion:", error);
      }
    }
  };

  return (
    <div>
      <h1>Blockchain Todo App</h1>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.content} - {task.completed ? "Completed" : "Incomplete"}
            <button onClick={() => toggleTaskCompletion(task.id)}>
              Toggle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
