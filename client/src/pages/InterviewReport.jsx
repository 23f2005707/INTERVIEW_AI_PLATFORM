import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ServerUrl } from '../App';
import axios from 'axios';
import Step3Report from '../components/Step3Report';


const InterviewReport = () => {
  
  const { id } = useParams()  // get id from api
  const [report, setReport] = useState(null);

  useEffect(() => {
    // fetch api report
    const fetchReport = async() => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id, { withCredentials: true })

        console.log(result.data)
        setReport(result.data)
      }
      catch(err) {
        console.log(err)
      }
    }

    fetchReport()

    }, [])


    // REPORT NOT FOUND
    if(!report) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <p className='text-gray-500 text-lg'>
            Loading Report...
          </p>
        </div>
      )
    }

    return <Step3Report report = {report} />
}

export default InterviewReport
