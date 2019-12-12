import React, { useState } from "react";

const useDropdown = (label, defaultState, options) => {
    const [state, updateState] = useState(defaultState);
    console.log('dd state is:', state)
    const id = `use-dropdown-${label.replace(" ", "").toLowerCase()}`;
    const Dropdown = () => (
        <label htmlFor={id}>
            {label}
            <select
                id={id}
                value={state}
                onChange={e => updateState(e.target.value)}
                onBlur={e => updateState(e.target.value)}
                disabled={!options.length}
            >
                {/* <option key='defaultPeriod'>{defaultState}</option> */}
                {options.map(item => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </label>
    );
    return [state, Dropdown, updateState];
};

export default useDropdown;
