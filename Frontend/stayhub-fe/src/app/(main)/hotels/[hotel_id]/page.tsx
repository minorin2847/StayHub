'use client';
import { useState } from 'react';


function Form() {
  const [name, setName] = useState('Taylor');

  return (
    <div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <div className="to-blue-300">
        <p>Hello, {name}.</p>
      </div>
      
    </div>
  );
}

export default Form;
