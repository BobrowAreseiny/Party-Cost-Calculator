/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */

import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import './App.css';
import './Checkbox.css';
import './Cost.css';

    interface Checkbox {
        waterFood: boolean;
        alcohol: boolean;
        carOwner: boolean;
        anotherFood: boolean;
}

function App() {
    const [count, setCount] = useState(6);
    const [personCosts, setPersonCosts] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>(['ARSENIY', 'SIMON', 'VLADIMIR', 'VLADISLAV', 'ZAHAR', 'AGNES']);

    const [checkboxes, setCheckboxes] = useState<Checkbox[]>(
        Array(6).fill({ waterFood: true, alcohol: true, carOwner: false, anotherFood: false })
    );

    const isFuelEnabled = checkboxes.some(checkbox => checkbox.carOwner);
    const isAnotherFoodEnabled = checkboxes.some(checkbox => checkbox.anotherFood);

    const [foodCost, setFoodCost] = useState<string>('');
    const [alcoholCost, setAlcoholCost] = useState<string>('');
    const [fuelCost, setFuelCost] = useState<string>('');
    const [anotherFoodCost, setAnotherFoodCost] = useState<string>('');
    const [result, setResult] = useState<string>('');


    const increaseCount = () => {
        setCount(prevCount => prevCount + 1);
        setCheckboxes([...checkboxes, { waterFood: true, alcohol: true, carOwner: false, anotherFood: false }]);
        setHeaders([...headers, `PERSON ${count + 1}`]);
        setFoodCost(foodCost);
    };

    const decreaseCount = () => {
        if (count > 1) {
            setCount(prevCount => prevCount - 1);
            setCheckboxes(checkboxes.slice(0, -1));
            setHeaders(headers.slice(0, -1));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setCount(value);
            const difference = value - checkboxes.length;
            if (difference > 0) {
                setCheckboxes([
                    ...checkboxes,
                    ...Array(difference).fill({ waterFood: true, alcohol: true, carOwner: false, anotherFood: false })
                ]);
                setHeaders([...headers, ...Array(difference).fill(`PERSON ${checkboxes.length + 1}`)]);
                setFoodCost(foodCost);
            } else if (difference < 0) {
                setCheckboxes(checkboxes.slice(0, value));
                setHeaders(headers.slice(0, value));
                setFoodCost(foodCost.slice(0, value));
            }
        }
    };

    const handleCheckboxChange = (index: number, field: keyof Checkbox) => {
        const updatedCheckboxes = checkboxes.map((checkbox, i) =>
            i === index ? { ...checkbox, [field]: !checkbox[field] } : checkbox
        );
        setCheckboxes(updatedCheckboxes);

        if (field === 'carOwner' && !updatedCheckboxes.some(checkbox => checkbox.carOwner)) {
            setFuelCost('');
        }

        if (field === 'anotherFood' && !updatedCheckboxes.some(checkbox => checkbox.anotherFood)) {
            setAnotherFoodCost('');
        }
    };

    const handlePositiveNumberInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        if (/^(?:\d*\.?\d*)$/.test(value) && (value === '' || parseFloat(value) > 0)) {
            setter(value);
        }
    };

    const handleHeaderChange = (index: number, value: string) => {
        const updatedHeaders = headers.map((header, i) => (i === index ? value : header));
        setHeaders(updatedHeaders);
    };

    const calculateCost = () => {
        const totalFoodCost = parseFloat(foodCost) || 0;
        const totalAlcoholCost = parseFloat(alcoholCost) || 0;
        const totalFuelCost = parseFloat(fuelCost) || 0;
        const totalAnotherFoodCost = parseFloat(anotherFoodCost) || 0;

        let totalCost = 0;

        const detailsPerPerson = headers.map((header, index) => {
            let personCost = 0;

            const hasPizzaSelected = checkboxes.some(cb => cb.anotherFood);

            let details = `${header}'s Summary:\n` + "-".repeat(20) + "\n";

            // Water & Food
            const applicableFoodPeople = checkboxes.filter(cb => cb.waterFood).length;
            const individualFoodCost = applicableFoodPeople > 0 ? totalFoodCost / applicableFoodPeople : 0;
            personCost += individualFoodCost;
            details += `Water & Food: ${individualFoodCost.toFixed(2)} byn.\n`;

            // Alcohol
            const applicableAlcoholPeople = checkboxes.filter(cb => cb.alcohol).length;
            const individualAlcoholCost = applicableAlcoholPeople > 0 ? totalAlcoholCost / applicableAlcoholPeople : 0;
            personCost += individualAlcoholCost;
            details += `Alcohol: ${individualAlcoholCost.toFixed(2)} byn.\n`;

            // Fuel
            if (checkboxes[index].carOwner) {
                details += `Fuel: 0.00 byn.\n`;
            } else {
                const applicableFuelPeople = checkboxes.filter(cb => !cb.carOwner).length;
                const individualFuelCost = applicableFuelPeople > 0 ? totalFuelCost / applicableFuelPeople : 0;
                personCost += individualFuelCost;
                details += `Fuel: ${individualFuelCost.toFixed(2)} byn.\n`;
            }

            // Pizza (only include if checkbox is true)
            if (hasPizzaSelected) {
                if (checkboxes[index].anotherFood) {
                    const applicablePizzaPeople = checkboxes.filter(cb => cb.anotherFood).length;
                    const individualPizzaCost = applicablePizzaPeople > 0 ? totalAnotherFoodCost / applicablePizzaPeople : 0;
                    personCost += individualPizzaCost;
                    details += `Other food: ${individualPizzaCost.toFixed(2)} byn.\n`;
                }
                else {
                    details += `Other food: 0.00 byn.\n`;
                }
            }
            else {
                details += `Other food: 0.00 byn.\n`;
            }

            details += `Total: ${personCost.toFixed(2)} byn.\n`;
            totalCost += personCost;

            return details;
        });
        setPersonCosts(detailsPerPerson);
        setResult(`${totalCost.toFixed(2)}`);
    };


    useEffect(() => {
        calculateCost();
    }, [foodCost, alcoholCost, fuelCost, anotherFoodCost, checkboxes, headers]);

    return (

        <>
            <h1>Party Cost Calculator</h1>
            <div className="card">
                <div className="cost-inputs">
                    <div className="cost-input-container">
                        <label>
                            Food Cost:
                            <input
                                type="text"
                                value={foodCost}
                                onChange={handlePositiveNumberInput(setFoodCost)}
                                className="cost-input"
                            />
                        </label>
                    </div>
                    <div className="cost-input-container">
                        <label>
                            Alcohol Cost:
                            <input
                                type="text"
                                value={alcoholCost}
                                onChange={handlePositiveNumberInput(setAlcoholCost)}
                                className="cost-input"
                            />
                        </label>
                    </div>
                    <div className="cost-input-container">
                        <label>
                            Other Food:
                            <input
                                type="text"
                                value={anotherFoodCost}
                                onChange={handlePositiveNumberInput(setAnotherFoodCost)}
                                className="cost-input"
                                disabled={!isAnotherFoodEnabled}
                            />
                            {
                                <span className="input-hint">Enable the "Pizza" checkbox to unlock this field  </span>                           
                            }
                         </label>
                    </div>
                    <div className="cost-input-container">
                        <label>
                            Fuel Cost:
                            <input
                                type="text"
                                value={fuelCost}
                                onChange={handlePositiveNumberInput(setFuelCost)}
                                className="cost-input"
                                disabled={!isFuelEnabled}
                            />
                                <span className="input-hint">Enable the "Car Owner" checkbox to unlock this field</span>
                        </label>
                    </div>
                </div>

                <div className="count-buttons">
                    <button onClick={decreaseCount} className="count-button">-</button>
                    <input
                        type="text"
                        className="count-input"
                        value={count}
                        onChange={handleInputChange}
                    />
                    <button onClick={increaseCount} className="count-button">+</button>
                </div>

                {result && (
                    <pre className="result-display">
                        Total Cost: <span className="highlighted-number">{result}</span>
                    </pre>
                )}
            </div>

            <div className="checkbox-grid">
                {checkboxes.map((checkbox, index) => (
                    <div className="checkbox-container" key={index}>
                        <input
                            type="text"
                            className="header-input"
                            value={headers[index]}
                            onChange={(e) => handleHeaderChange(index, e.target.value)}
                        />
                        <div className="checkbox-list inline-checkboxes">
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={checkbox.waterFood}
                                        onChange={() => handleCheckboxChange(index, 'waterFood')}
                                    />
                                    Water & Food
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={checkbox.alcohol}
                                        onChange={() => handleCheckboxChange(index, 'alcohol')}
                                    />
                                    Alcohol
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={checkbox.anotherFood}
                                        onChange={() => handleCheckboxChange(index, 'anotherFood')}
                                    />
                                    Other Food
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={checkbox.carOwner}
                                        onChange={() => handleCheckboxChange(index, 'carOwner')}
                                    />
                                    Car Owner
                                </label>
                            </div>

                        </div>
                        {personCosts[index] && (
                            <pre
                                className="cost-details result-display"
                                onClick={() => navigator.clipboard.writeText(personCosts[index])}
                                title="Click to copy to clipboard"
                            >
                                {personCosts[index]}
                            </pre>
                        )}
                    </div>
                ))}
            </div>

        </>
    );
}

export default App;
