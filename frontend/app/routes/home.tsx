import type { Route } from "./+types/home";
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TodoListABI from '../../abi/todolist.abi.json';

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
  const [newTask, setNewTask] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    const loadProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' }); 
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
        } catch (error) {
          console.error('Error creating Web3 provider:', error);
        }
      } else {
        console.error('Metamask not detected. Please install Metamask.');
      }
    };

    loadProvider();

    const loadBlockchainData = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' }); 
          await provider?.send('eth_requestAccounts', []);
          const signer = await provider?.getSigner();
          const todoContract = new ethers.Contract(
            import.meta.env.VITE_CONTRACT_ADDRESS as string,
            TodoListABI,
            signer,
          );

          setContract(todoContract);

          const taskCount = await provider?.send('eth_call', [
            {
              to: import.meta.env.VITE_CONTRACT_ADDRESS,
              data: todoContract.interface.encodeFunctionData('taskCount', []),
            },
          ]);
          // const taskCount = await todoContract.taskCount();
          const loadedTasks: Task[] = [];

          for (let i = 0; i < parseInt(taskCount); i++) {
            const task = await provider?.send('eth_call', [
              {
                to: import.meta.env.VITE_CONTRACT_ADDRESS,
                data: todoContract.interface.encodeFunctionData('tasks', [i]),
              },
            ]);
            // const task = await todoContract.tasks(i);
            loadedTasks.push({
              id: task.id.toNumber(),
              content: task.content,
              completed: task.completed,
            });
          }

          setTasks(loadedTasks);
        } catch (error) {
          console.error('Error loading blockchain data:', error);
        }
      } else {
        alert('Please install Metamask!');
      }
    };

    loadBlockchainData();
  }, []);

  const addTask = async () => {
    const accounts = await provider?.send('eth_requestAccounts', []);
    const nonce = await provider?.send('eth_getTransactionCount', [accounts[0], 'latest']);
    console.log(nonce);
    if (contract) {
      try {
        const tx = await provider?.send('eth_sendTransaction', [
          {
            from: accounts[0],
            to: import.meta.env.VITE_CONTRACT_ADDRESS,
            nonce,
            data: contract.interface.encodeFunctionData('createTask', [newTask]),
          },
        ]);
        // const tx = await contract.createTask(newTask);
        setNewTask('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const toggleTaskCompletion = async (id: number) => {
    if (contract) {
      try {
        const tx = await contract.toggleComplete(id);
        await tx.wait(); // Wait for the transaction to be mined
      } catch (error) {
        console.error('Error toggling task completion:', error);
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
            {task.content} - {task.completed ? 'Completed' : 'Incomplete'}
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

