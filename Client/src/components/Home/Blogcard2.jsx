import React from 'react'
import { Link } from 'react-router-dom'
import parse from 'html-react-parser'


const Blogcard2 = ({ data }) => {


  return (
    <div className="p-4 md:w-[380px]">
      <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden">
        <Link to={`/blogdetail/${data?.slug}_${data.id}`} key={data.id}>

          <img className="lg:h-48 md:h-36 w-full object-cover object-center" src={data.image} alt="blog" />

          <div className="p-6">
            <h1 className="title-font text-lg font-medium text-gray-900 mb-3">{data.title}</h1>
            <p className="leading-relaxed mb-3">{parse(data.content ? data.content : "no data")}</p>
            <div className="flex items-center flex-wrap ">
              <p  className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0">Afficher plus
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </p>
              
            </div>

          </div>
        </Link>
        {/* <div className="btn flex gap-4 px-4 py-2"> 
          <Link to={`/updateblog/${data.slug}_${data.id}`}>  
         <button className='py-2 px-4 bg-green-600 text-lg rounded-2xl text-white' >edit</button>
         </Link>
          <button className='py-2 px-4 bg-red-600 text-lg rounded-2xl text-white'  >delete</button>
        </div>*/}
      </div>


    </div>

  )
}

export default Blogcard2