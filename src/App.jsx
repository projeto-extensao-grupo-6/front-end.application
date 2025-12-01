import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { routes } from './provider/route';

function App() {
  return (
      <>
        <RouterProvider router={routes} />
      </>
  );
}

export default App;