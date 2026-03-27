import React from 'react';
import { Loader } from './loader.js';
import { getData } from './data.js';
import { Admin } from './admin.js'
import { predictedValue } from './tensor.js';

const data = await getData();

export const Dyo = () => {

  return (
    <>
      <Admin data={data} />
      <Loader />
    </>
  );

};