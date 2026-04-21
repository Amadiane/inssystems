import React from 'react';

const Footersubscibe = () => {
  return (
    <div className="lg:w-1/4 md:w-1/2 w-full px-4">
      <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3">SUBSCRIBE</h2>
      <div className="flex xl:flex-nowrap md:flex-nowrap lg:flex-wrap flex-wrap justify-center items-end md:justify-start">
        <div className="relative w-40 sm:w-auto xl:mr-4 lg:mr-0 sm:mr-4 mr-2">
          <label htmlFor="footer-field" className="leading-7 text-sm text-white">Placeholder</label>
          <input
            type="text"
            id="footer-field"
            name="footer-field"
            className="w-full bg-white bg-opacity-50 rounded border border-white focus:bg-transparent focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base outline-none text-white py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
          />
        </div>
        <button className="lg:mt-2 xl:mt-0 flex-shrink-0 inline-flex text-white bg-white border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">
          Button
        </button>
      </div>
      <p className="text-white text-sm mt-2 md:text-left text-center">
        Bitters chicharrones fanny pack
        <br className="lg:block hidden" />
        waistcoat green juice
      </p>
    </div>
  );
};

export default Footersubscibe;
