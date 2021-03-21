import React, { FC } from 'react';
import './App.css';
import TopHeader from "./components/TopHeader";
import MainContent from "./components/MainContent";
import BottomHeater from "./components/BottomHeater";



const App: FC = () => (
    <div className="App">
        <TopHeader/>
        <MainContent/>
        <BottomHeater/>
    </div>
);

export default App;
