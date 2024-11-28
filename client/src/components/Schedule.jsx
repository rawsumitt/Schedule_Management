import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

const phaseSubjects = {
  phase1: [
    ["Anatomy", "anatomy"],
    ["Physiology", "physiology"],
    ["Biochemistry", "biochemistry"],
    ["Community-Medicine", "communitymedicine"],
    ["Foundation-Course", "foundationcourse"],
    ["ECA", "ecaI"],
  ],
  phase2: [
    ["Community Medicine", "communitymedicine2"],
    ["Pathology", "pathology"],
    ["Microbiology", "microbiology"],
    ["Pharmacology", "pharmacology"],
    ["Forensic Med & TC", "forensicmedandtc1"],
    ["Medicine", "medicine1"],
    ["Surgery", "surgery1"],
    ["Obs & Gyn", "obsandgyn1"],
    ["ECA", "eca2"],
  ],
  phase3_p1: [
    ["Community Medicine", "communitymedicine3"],
    ["Medicine", "medicine2"],
    ["Surgery", "surgery2"],
    ["Paediatrics", "paediatrics"],
    ["Forensic Med & TC", "forensicmedandtc2"],
    ["Orthopaedics", "orthopaedics"],
    ["Ophthalmology", "ophthalmology"],
    ["ENT", "ent"],
    ["Obs & Gyn", "obsandgyn2"],
    ["ECA", "ecaIII"],
  ],
  phase3_p2: [
    ["Psychiatry", "psychiatry"],
    ["Medicine", "medicine3"],
    ["Surgery", "surgery3"],
    ["Dermatology", "dermatology"],
    ["Radiology", "radiology"],
    ["Orthopaedics", "orthopaedics2"],
    ["Paediatrics", "paediatrics2"],
    ["ENT", "ent2"],
    ["Anaesthesiology", "anaesthsiology"],
    ["Ophthalmology", "ophthalmology2"],
    ["Obs & Gyn", "obsandgyn3"],
  ],
};

const lectureTypes = [
  "Lecture",
  "Practical",
  "Morning Posting",
  "Family Adoption Programme",
  "Self Directed Learning",
  "Small Group Discussion",
  "AETCOM",
  "Pandemic Module",
  "Sports/ Yoga & Extra Curricular Activities",
  "Electives",
];

const Schedule = () => {
  const [phase, setPhase] = useState("phase1");
  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    subject: phaseSubjects[phase][0][0], // Default to the first subject
    teacher_name: teachers[0]?.teacher_name || "", // Default to the first teacher
    duration: 0,
    lect_type: lectureTypes[0], // Default to the first lecture type
    repeat_weeks: 1,
  });
  

  useEffect(() => {
    // Fetch teachers from backend
    axios.get("http://localhost:5000/teacher/fetch").then((res) => {
      setTeachers(res.data.data);
    });
  }, []);

  // Fetch schedules for selected phase
  // useEffect(() => {
  //   axios
  //     .get(`http://localhost:5000/schedule/${phase}`)
  //     .then((response) => {
  //       const fetchedEvents = response.data.data.map((schedule) => ({
  //         title: `${schedule.subject} (${schedule.teacher_name})`,
  //         start: `${schedule.date.split("T")[0]}T${schedule.start_time}`,
  //         end: `${schedule.date.split("T")[0]}T${schedule.end_time}`,
  //       }));
  //       // console.log(fetchedEvents)
  //       if(fetchedEvents){
  //         setEvents(fetchedEvents);
  //       }else{
  //         setEvents([]);
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // }, [phase,events]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/schedule/${phase}`)
      .then((response) => {
        // Check if response data exists and has schedules
        const schedules = response.data.data;
        if (Array.isArray(schedules) && schedules.length > 0) {
          const fetchedEvents = schedules.map((schedule) => ({
            title: `${schedule.subject} (${schedule.teacher_name})`,
            start: `${schedule.date.split("T")[0]}T${schedule.start_time}`,
            end: `${schedule.date.split("T")[0]}T${schedule.end_time}`,
          }));
          setEvents(fetchedEvents);
        } else {
          // Set to empty array if no schedules are found
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        // Set to empty array in case of an error
        setEvents([]);
      });
  }, [phase,events]);
  

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      subject: phaseSubjects[phase][0][0], // First subject for the selected phase
      teacher_name: teachers[0]?.teacher_name || "", // First teacher, if available
    }));
  }, [phase, teachers]);
  

  const handleDateClick = (info) => {
    console.log(info.dateStr);
    setSelectedDate(info.dateStr);


    let isoDateString = info.dateStr;
    let date = new Date(isoDateString);
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    let formattedTime = `${hours}:${minutes}:${seconds}`;
    console.log(formattedTime);
    setSelectedTime(formattedTime);
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {

  if (!selectedDate || !selectedTime || !formData.subject || !formData.teacher_name || !formData.lect_type) {
    console.error("All fields must be filled before submitting.");
    alert("Please fill in all fields.");
    return;
  }

  // Construct the full datetime string (single 'T' separator)
  const fullDateTime = `${selectedDate}`;

  // Log the full datetime string for debugging purposes
  console.log("Full DateTime String:", fullDateTime);

  // Create a new Date object using the full datetime string
  const startDate = new Date(fullDateTime);

  // Check if startDate is valid
  if (isNaN(startDate.getTime())) {
    console.error("Invalid Date object:", fullDateTime);
    return;
  }

  // Calculate the end time by adding the duration (in minutes)
  const endDate = new Date(startDate.getTime() + formData.duration * 60 * 1000);

  // Format the end time as HH:MM:SS
  const endTime = endDate
    .toTimeString() // Get the full time string
    .split(" ")[0]; // Extract the time part (HH:MM:SS)

  console.log("Calculated End Time:", endTime);

  const events = [];
  for (let i = 0; i < formData.repeat_weeks; i++) {
    const eventDate = new Date(startDate);
    eventDate.setDate(startDate.getDate() + i * 7); // Add i * 7 days to get the same weekday in subsequent weeks
    events.push({
      phase,
      date: eventDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      start_time: selectedTime,
      end_time: endTime,
      subject: formData.subject,
      lect_type: formData.lect_type,
      teacher_name: formData.teacher_name,
    });
  }

  console.log("Events to be submitted:", events);

  try {
    await axios.post("http://localhost:5000/schedule/add", { events });
    setModalOpen(false);
    setFormData({
      subject: "",
      teacher_name: "",
      duration: 0,
      lect_type: "",
      repeat_weeks: 1,
    });
    alert("Schedule added successfully!");
  } catch (err) {
    alert("Failed to add schedule.");
    console.error("Error adding schedule:", err);
  }
};


return (
  <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
    <h2 className="text-3xl font-bold mb-6 text-center text-gray-50">Set Schedule</h2>
    <div className="flex justify-center mb-4">
      <label className="text-lg font-semibold mr-4">Select Phase:</label>
      <select
        value={phase}
        onChange={(e) => setPhase(e.target.value)}
        className="px-4 py-2 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-400 bg-gray-800 text-gray-300"
      >
        <option value="phase1">Phase 1</option>
        <option value="phase2">Phase 2</option>
        <option value="phase3_p1">Phase 3 Part 1</option>
        <option value="phase3_p2">Phase 3 Part 2</option>
      </select>
    </div>

    <div className="bg-gray-800 shadow-lg rounded-lg p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        height="auto"
        className="rounded-md overflow-hidden text-gray-50"
      />
    </div>

    {modalOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-96">
          <h3 className="text-2xl font-bold text-gray-50 mb-4">Add Schedule</h3>
          <label className="block mb-2 font-semibold text-gray-400">Date:</label>
          <input
            type="text"
            value={selectedDate.split("T")[0]}
            readOnly
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          />
          <label className="block mb-2 font-semibold text-gray-400">Start Time:</label>
          <input
            type="text"
            value={selectedTime}
            readOnly
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          />
          <label className="block mb-2 font-semibold text-gray-400">Duration (minutes):</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleFormChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          />
          <label className="block mb-2 font-semibold text-gray-400">Subject:</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleFormChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          >
            <option value="" disabled>
              Select Subject
            </option>
            {phaseSubjects[phase].map(([label, value]) => (
              <option value={label} key={value}>
                {label}
              </option>
            ))}
          </select>
          <label className="block mb-2 font-semibold text-gray-400">Faculty:</label>
          <select
            name="teacher_name"
            value={formData.teacher_name}
            onChange={handleFormChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          >
            <option value="" disabled>
              Select Faculty
            </option>
            {teachers.map((teacher) => (
              <option value={teacher.teacher_name} key={teacher.id}>
                {teacher.teacher_name}
              </option>
            ))}
          </select>
          <label className="block mb-2 font-semibold text-gray-400">Lecture Type:</label>
          <select
            name="lect_type"
            value={formData.lect_type}
            onChange={handleFormChange}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
          >
            <option value="" disabled>
              Select Lecture Type
            </option>
            {lectureTypes.map((type, index) => (
              <option value={type} key={index}>
                {type}
              </option>
            ))}
          </select>
          <label className="block mb-2 font-semibold text-gray-400">Repetitive Weeks:</label>
          <input
            type="number"
            name="repeat_weeks"
            min="1"
            value={formData.repeat_weeks || 1}
            onChange={(e) =>
              setFormData({ ...formData, repeat_weeks: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-6"
          />
          <div className="flex justify-between">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Schedule
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default Schedule;