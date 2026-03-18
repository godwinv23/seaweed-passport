'use client'

import React, { useState, useEffect, useRef } from "react"
import jsQR from "jsqr"
import {
  MapPin,
  ShieldCheck,
  Leaf,
  Droplets,
  Thermometer,
  Activity,
  FileCheck,
  ChefHat,
  Info,
  ChevronDown,
  ChevronUp,
  Anchor,
  Award,
  QrCode,
  AlertCircle,
  X,
} from "lucide-react"


/* ---------------- MOCK DATA ---------------- */

const batchData = {
  id: "SK-2026-04A",
  species: "Saccharina latissima",
  commonName: "Sugar Kelp",
  grade: "Grade A - Premium Food Grade",
  harvestDate: "March 2, 2026",
  status: "Verified Safe & Compliant",
  origin: {
    location: "Kilkieran Bay",
    county: "County Galway",
    country: "Ireland",
    method: "Manual Foraging",
    harvester: "O'Flaherty Cooperative",
    coordinates: "53.3167° N, 9.7333° W",
  },
  environment: {
    temperature: "11.2°C",
    salinity: "34.1 PSU",
  },
  sensory: {
    appearance: "Deep olive-green translucent sheets",
    texture: "Fleshy and slightly cartilaginous",
    flavor: "Sweet umami marine finish",
    pairing: "Great for dashi or roasting",
  },
  safety: {
    lab: "Marine Analytic Labs Galway",
    dateTested: "March 4, 2026",
  },
  nutrition: {
    calories: 4,
    protein: "0.17g",
    carbs: "0.96g",
    fiber: "0.1g",
    fat: "0.06g",
  },
}


/* ---------------- UI COMPONENTS ---------------- */

const Accordion = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border rounded-xl mb-4 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between w-full p-4"
      >
        <div className="flex items-center gap-2">
          <Icon size={18}/>
          <span className="font-semibold">{title}</span>
        </div>

        {open ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
      </button>

      {open && <div className="p-4 border-t">{children}</div>}
    </div>
  )
}

const Badge = ({ children }) => (
  <span className="px-2 py-1 text-xs rounded bg-teal-100 text-teal-700">
    {children}
  </span>
)


/* ---------------- QR SCANNER ---------------- */

const QRScanner = ({ onScan }) => {

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error,setError] = useState(null)

  useEffect(()=>{

    let stream
    let animationFrame

    const startCamera = async () => {

      try{

        stream = await navigator.mediaDevices.getUserMedia({
          video:{ facingMode:"environment" }
        })

        videoRef.current.srcObject = stream
        videoRef.current.play()

        scan()

      }catch(e){

        setError("Camera blocked. Use demo scan button.")

      }

    }

    const scan = () => {

      const video = videoRef.current
      const canvas = canvasRef.current

      if(video.readyState === video.HAVE_ENOUGH_DATA){

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")
        ctx.drawImage(video,0,0,canvas.width,canvas.height)

        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height)

        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height
        )

        if(code){

          onScan(code.data)
          return

        }

      }

      animationFrame = requestAnimationFrame(scan)

    }

    startCamera()

    return ()=>{

      if(stream) stream.getTracks().forEach(t=>t.stop())
      cancelAnimationFrame(animationFrame)

    }

  },[onScan])



  return(

    <div className="flex flex-col h-full bg-slate-900 text-white">

      <div className="p-6 text-center">
        <h1 className="text-xl font-bold">Seaweed Passport</h1>
        <p className="text-sm text-teal-400">
          Scan product QR code
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">

        <video
          ref={videoRef}
          className="absolute opacity-60"
        />

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        <div className="w-60 h-60 border-2 border-teal-400 rounded-xl"/>

      </div>

      <div className="p-6">

        {error && (
          <div className="bg-red-800 p-3 rounded mb-4 flex gap-2">
            <AlertCircle size={18}/>
            {error}
          </div>
        )}

        <button
          onClick={()=>onScan("DEMO")}
          className="bg-teal-600 w-full py-3 rounded-lg flex justify-center gap-2"
        >
          <QrCode size={18}/>
          Simulate Scan
        </button>

      </div>

    </div>

  )

}


/* ---------------- PASSPORT VIEW ---------------- */

const PassportView = ({data,onReset}) => {

  return(

    <div>

      <div className="flex justify-between p-4 border-b bg-white">

        <div className="flex gap-2 items-center font-bold text-teal-700">
          <Leaf size={18}/>
          Seaweed Passport
        </div>

        <button onClick={onReset}>
          <X/>
        </button>

      </div>


      <div className="bg-teal-900 text-white text-center p-8">

        <Leaf size={40} className="mx-auto mb-4"/>

        <h1 className="text-2xl font-bold">
          {data.commonName}
        </h1>

        <p className="italic">{data.species}</p>

        <div className="mt-3 flex justify-center gap-2">
          <Badge>Food Grade</Badge>
          <Badge>Organic</Badge>
        </div>

      </div>


      <div className="bg-emerald-500 text-white text-center py-2">
        <ShieldCheck size={16} className="inline mr-2"/>
        {data.status}
      </div>


      <div className="p-4">

        <Accordion title="Origin" icon={MapPin} defaultOpen>

          <p>
            Harvested in {data.origin.location}, {data.origin.county}
          </p>

          <p>Method: {data.origin.method}</p>

        </Accordion>


        <Accordion title="Environmental Data" icon={Activity}>

          <p>Temperature: {data.environment.temperature}</p>
          <p>Salinity: {data.environment.salinity}</p>

        </Accordion>


        <Accordion title="Sensory Profile" icon={ChefHat}>

          <p>{data.sensory.flavor}</p>
          <p>{data.sensory.texture}</p>

        </Accordion>


        <Accordion title="Lab Safety" icon={FileCheck}>

          <p>Lab: {data.safety.lab}</p>
          <p>Date: {data.safety.dateTested}</p>

        </Accordion>


        <Accordion title="Nutrition" icon={Info}>

          <p>Calories: {data.nutrition.calories}</p>
          <p>Protein: {data.nutrition.protein}</p>

        </Accordion>


        <div className="text-center mt-10">

          <Award size={30} className="mx-auto text-green-600"/>

          <p className="text-sm mt-2">
            Verified Sustainable Supply Chain
          </p>

        </div>

      </div>

    </div>

  )

}


/* ---------------- MAIN APP ---------------- */

export default function App(){

  const [data,setData] = useState(null)

  const handleScan = ()=>{

    setData(batchData)

  }

  const reset = ()=>{

    setData(null)

  }

  return(

    <div className="min-h-screen bg-slate-100">

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">

        {!data ? (
          <QRScanner onScan={handleScan}/>
        ) : (
          <PassportView data={data} onReset={reset}/>
        )}

      </div>

    </div>

  )

}
