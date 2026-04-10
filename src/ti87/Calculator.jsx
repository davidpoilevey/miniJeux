import React, { useState } from 'react';
import Graph from './Graph';
import { Alert, Box, Button, InputAdornment, Slider, TextField } from '@mui/material';

const Calculator = () => {
    const [equation, setEquation] = useState('Math.cos(x**2) + 3 * Math.sin(x) - 1');
    const [gEquation, setGEquation] = useState('Math.cos(x**2) + 3 * Math.sin(x) - 1');
    const [errMsg, setErr] = useState();
    const [scaleX, setScaleX] = useState(40);
    const [scaleY, setScaleY] = useState(40);


    const handleChange = (event) => {
        setEquation(event.target.value);
        setErr(null);
    };
    const setGraph = () => {
        setGEquation(equation);
    }
    const setCos = ()=>{
        setEquation(eq=>(eq+' Math.cos(x)'));
    }
    const setSin = ()=>{
        setEquation(eq=>(eq+' Math.sin(x)'));
    }
    const setLn = ()=>{
        setEquation(eq=>(eq+' Math.log10(x)'));
    }
    const setE = ()=>{
        setEquation(eq=>(eq+' Math.exp(x)'));
    }
    const setRacine = ()=>{
        setEquation(eq=>(eq+' Math.sqrt(x)'));
    }
    const setAuCarre = ()=>{
        setEquation(eq=>(eq+'**2'));
    }

    return (
        // container
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background:'silver',border:'8px ridge blue', padding:20, borderRadius:'50px' }}>
            <Box  style={{ display: 'flex', flexDirection:'column' }}>
                {/* bar button */}
                <Button onClick={setAuCarre}>au carré</Button>
                <Button onClick={setRacine}>√x</Button>
                <Button onClick={setCos}>cos(x)</Button>
                <Button onClick={setSin}>sin(x)</Button>
                <Button onClick={setLn}>ln(x)</Button>
                <Button onClick={setE}>e(x)</Button>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
                {/* title  equation et graph*/}

                <Box style={{ display: 'flex'}}>

                    <TextField sx={{ m: 2 ,border: '1px solid black' , backgroundColor:'#e8e8e8', borderRadius:'5px', marginLeft:0}} fullWidth 
                    value={equation} onChange={handleChange} InputProps={{
                        startAdornment: <InputAdornment position="start">f(x)=</InputAdornment>,
                    }}
                    />
                    <Button onClick={setGraph}>Qu'est-ce ca donne ?</Button>
                </Box>
                <Box>

                    {errMsg && <Alert severity="error">{errMsg}</Alert>}
                </Box>
                <Box>
                    {/* graph */}
                    <Graph equation={gEquation} scaleX={scaleX} scaleY={scaleY} setErr={setErr}/>
                </Box>


            </Box>
            <Box>
                {/* slider scale */}
                <div>
                    <div>Echelle: {scaleX}</div>
                    <Slider value={scaleX} orientation="vertical"
                        min={5} max={500} step={1}
                        onChange={(event, newValue) => {
                            setScaleX(newValue);
                            setScaleY(newValue);
                        }}
                        style={{ height: 300 }}
                    />
                </div>
            </Box>
         </Box>
         </Box>
            );
};

            export default Calculator;
