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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTab, setSelectedTab] = useState("update"); // "update" or "delete"
  const [disabledDates, setDisabledDates] = useState([]);


  const [formData, setFormData] = useState({
    subject: phaseSubjects[phase][0][0], // Default to the first subject
    teacher_name: teachers[0]?.teacher_name || "", // Default to the first teacher
    duration: 0,
    lect_type: lectureTypes[0] || "", // Default to the first lecture type
    repeat_weeks: 1,
  });

  useEffect(() => {
    if (!selectedDate || !selectedTime || !formData.duration) return;
  
    const fullDateTime = `${selectedDate}T${selectedTime}`;
    const startDate = new Date(fullDateTime);
    const endDate = new Date(startDate.getTime() + formData.duration * 60 * 1000);
  
    const startTime = startDate.toISOString().split("T")[1];
    const endTime = endDate.toISOString().split("T")[1];
  
    axios
      .post("http://localhost:5000/teacher/fetch", {
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
      })
      .then((res) => {
        setTeachers(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching teachers:", err);
        setTeachers([]);
      });
  }, [selectedDate, selectedTime, formData.duration]);
  

  useEffect(() => {
    axios
      .get(`http://localhost:5000/schedule/${phase}`)
      .then((response) => {
        const schedules = response.data.data;

        if (Array.isArray(schedules) && schedules.length > 0) {
          const fetchedEvents = schedules.map((schedule) => ({
            id: schedule._id,
            title: `${schedule.subject} (${schedule.teacher_name})`,
            start: `${schedule.date.split("T")[0]}T${schedule.start_time}`, // Combine date and time
            end: `${schedule.date.split("T")[0]}T${schedule.end_time}`, // Combine date and time
          }));

          console.log(fetchedEvents);

          setEvents(fetchedEvents);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        setEvents([]);
      });
  }, [phase]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      subject: phaseSubjects[phase][0][0], // First subject for the selected phase
      teacher_name: teachers[0]?.teacher_name || "", // First teacher, if available
    }));
  }, [phase, teachers]);

  //to fetch holidays
  // useEffect(() => {
  //   const fetchHolidays = async () => {
  //     const currentYear = new Date().getFullYear(); // Get the current year dynamically
  //     const apiKey = "2uWe0PfqI0IUOhYJFmT0fJfLMxvcwRXa"; // Your API key
  //     const apiUrl = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=IN&year=${currentYear}`;
  
  //     try {
  //       const response = await axios.get(apiUrl);
  //       const holidays = response.data.response.holidays;
  
  //       // Filter only national holidays
  //       const nationalHolidays = holidays.filter((holiday) =>
  //         holiday.type.includes("National holiday")
  //       );
  
  //       // Map national holidays to FullCalendar event format (all-day events)
  //       const holidayEvents = nationalHolidays.map((holiday) => ({
  //         id: `holiday-${holiday.date.iso}`, // Unique ID for each holiday
  //         title: `${holiday.name}`,
  //         start: new Date(`${holiday.date.iso}T02:40:00.000Z`), // Use the `iso` date format
  //         end: new Date(`${holiday.date.iso}T15:00:00.000Z`), // Use the `iso` date format
  //         allDay: true, // Mark as all-day event
  //         backgroundColor: "red", // Different color for national holidays
  //         borderColor: "red", // Consistent with background
  //       }));
  
  //       // Merge holiday events with schedule events
  //       console.log(holidayEvents)
  //       setEvents((prevEvents) => [...prevEvents, ...holidayEvents]);
  
  //       // Prevent scheduling on holidays
  //       setDisabledDates(nationalHolidays.map((holiday) => holiday.date.iso));
  //     } catch (error) {
  //       console.error("Error fetching national holidays:", error);
  //     }
  //   };
  
  //   fetchHolidays();
  // }, [phase]);


  useEffect(() => {
    const fetchHolidays = async () => {
      const currentYear = new Date().getFullYear(); // Get the current year dynamically
      const apiKey = "2uWe0PfqI0IUOhYJFmT0fJfLMxvcwRXa"; // Your API key
      const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2]; // Array of years to fetch holidays for
  
      try {
        const allHolidayEvents = [];
        const allDisabledDates = [];
  
        for (const year of years) {
          const apiUrl = `https://calendarific.com/api/v2/holidays?&api_key=${apiKey}&country=IN&year=${year}`;
          const response = await axios.get(apiUrl);
          const holidays = response.data.response.holidays;
  
          // Filter only national holidays
          const nationalHolidays = holidays.filter((holiday) =>
            holiday.type.includes("National holiday")
          );
  
          // Map national holidays to FullCalendar event format (all-day events)
          const holidayEvents = nationalHolidays.map((holiday) => ({
            id: `holiday-${holiday.date.iso}`, // Unique ID for each holiday
            title: `${holiday.name}`,
            start: new Date(`${holiday.date.iso}T02:40:00.000Z`), // Start of holiday
            end: new Date(`${holiday.date.iso}T15:00:00.000Z`), // End of holiday
            allDay: true, // Mark as all-day event
            backgroundColor: "red", // Different color for national holidays
            borderColor: "red", // Consistent with background
          }));
  
          // Collect events and disabled dates
          allHolidayEvents.push(...holidayEvents);
          allDisabledDates.push(...nationalHolidays.map((holiday) => holiday.date.iso));
        }
  
        // Merge holiday events with schedule events
        setEvents((prevEvents) => [...prevEvents, ...allHolidayEvents]);
  
        // Prevent scheduling on holidays
        setDisabledDates(allDisabledDates);
  
      } catch (error) {
        console.error("Error fetching national holidays:", error);
      }
    };
  
    fetchHolidays();
  }, [phase]);
  
  

  const handleDateClick = (info) => {
    const isoDateString = info.dateStr;
    const date = new Date(isoDateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
  
    setSelectedEvent(null); // Clear previous event selection
    setSelectedDate(isoDateString.split("T")[0]); // Extract date only
    setSelectedTime(`${hours}:${minutes}:00`); // Set time from the clicked slot
    setFormData({
      subject: phaseSubjects[phase][0][0], // Default subject for the phase
      teacher_name: teachers[0]?.teacher_name || "", // Default to the first teacher
      duration: 0,
      lect_type: lectureTypes[0] || "", // Default to the first lecture type
      repeat_weeks: 1,
    });
    setModalOpen(true); // Open the modal
    setSelectedTab("update"); // Default to update tab
  };

  
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const startDate = new Date(`${formData.date}T${formData.start_time}`);
      const endDate = new Date(`${formData.date}T${formData.end_time}`);

      // Convert times to "HH:mm:ss.000Z" format for MongoDB schema
      const startTime = startDate.toISOString().split("T")[1];
      const endTime = endDate.toISOString().split("T")[1];

      // Check for overlapping events
      const isOverlapping = events.some((event) => {
        if (event.id === selectedEvent.id) return false; // Skip the current event being updated

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        return (
          (startDate >= eventStart && startDate < eventEnd) ||
          (endDate > eventStart && endDate <= eventEnd) ||
          (startDate <= eventStart && endDate >= eventEnd)
        );
      });

      if (isOverlapping) {
        alert("The updated time slot overlaps with an existing event.");
        return;
      }

      const updatedEvent = {
        id: selectedEvent.id,
        phase,
        date: formData.date,
        start_time: startTime,
        end_time: endTime,
        subject: formData.subject,
        teacher_name: formData.teacher_name,
      };
      console.log(updatedEvent)

      await axios.put("http://localhost:5000/schedule/update", updatedEvent);
      alert("Event updated successfully!");

      // Remove the old event and add the updated event
      setEvents((prevEvents) =>
        prevEvents
          .filter(
            (event) =>
              event.id !== selectedEvent.id ||
              event.start.split("T")[0] !== formData.date
          )
          .concat({
            id: selectedEvent.id,
            title: `${formData.subject} (${formData.teacher_name})`,
            start: `${formData.date}T${formData.start_time}`,
            end: `${formData.date}T${formData.end_time}`,
          })
      );

      setModalOpen(false);
    } catch (err) {
      alert("Failed to update event.");
      console.error("Error updating event:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) {
      alert("No event selected for deletion.");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/schedule/delete", {
        id: selectedEvent.id,
      });
      alert("Event deleted successfully!");
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      setModalOpen(false);
    } catch (err) {
      alert("Failed to delete event.");
      console.error("Error deleting event:", err);
    }
  };
  

  const handleEventClick = (info) => {
    const clickedEventId = info.event.id; // Unique ID of the clicked event
    const clickedEventStart = info.event.start.toISOString(); // Start time of the clicked event
    const clickedEventEnd = info.event.end.toISOString(); // End time of the clicked event
  
    // Find the exact event based on ID, start time, and end time
    const event = events.find(
      (evt) =>
        evt.id === clickedEventId &&
        new Date(evt.start).toISOString() === clickedEventStart &&
        new Date(evt.end).toISOString() === clickedEventEnd
    );
  
    if (event) {
      // Extract details from the matched event
      const [subject, teacher_name] = event.title.split(" (");
      setSelectedEvent(event);
      console.log("Selected Event",event)
  
      setFormData({
        subject: subject.trim(),
        teacher_name: teacher_name.replace(")", "").trim(),
        start_time: event.start.split("T")[1], // Time part of the start time
        end_time: event.end.split("T")[1], // Time part of the end time
        date: event.start.split("T")[0], // Date part of the start time
      });
  
      setModalOpen(true);
      setSelectedTab("update");
    } else {
      console.error("No matching event found.");
      alert("Error: Could not find the selected event.");
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !formData.subject ||
      !formData.teacher_name ||
      !formData.lect_type
    ) {
      alert("Please fill in all fields.");
      return;
    }
  
    const startDate = new Date(`${selectedDate}T${selectedTime}`);
    if (isNaN(startDate.getTime())) {
      alert("Invalid date or time. Please check your inputs.");
      return;
    }
  
    // Calculate the end time based on the duration
    const endDate = new Date(startDate.getTime() + formData.duration * 60 * 1000);
    const startTime = startDate.toISOString().split("T")[1]; // "HH:mm:ss.000Z"
    const endTime = endDate.toISOString().split("T")[1]; // "HH:mm:ss.000Z"
  
    // Prevent scheduling on holidays
    if (disabledDates.includes(selectedDate)) {
      alert("Cannot schedule on a national holiday.");
      return;
    }
  
    // Check for overlapping events
    const isOverlapping = events.some((event) => {
      const eventStartDate = new Date(event.start).toISOString().split("T")[0]; // Ensure event.start is converted to a string date
      if (eventStartDate !== selectedDate) return false; // Skip other dates
  
      const eventStart = new Date(event.start); // Convert event.start to a Date object
      const eventEnd = new Date(event.end); // Convert event.end to a Date object
  
      return (
        (startDate >= eventStart && startDate < eventEnd) ||
        (endDate > eventStart && endDate <= eventEnd) ||
        (startDate <= eventStart && endDate >= eventEnd)
      );
    });
  
    if (isOverlapping) {
      alert("Schedule overlaps with an existing event.");
      return;
    }
  
    // Generate recurring events, skipping holidays
    const eventsToAdd = [];
    for (let i = 0; i < formData.repeat_weeks; i++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + i * 7);
  
      const formattedDate = eventDate.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
  
      if (disabledDates.includes(formattedDate)) {
        console.log(`Skipping holiday on ${formattedDate}`);
        continue;
      }
  
      eventsToAdd.push({
        phase,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        subject: formData.subject,
        lect_type: formData.lect_type,
        teacher_name: formData.teacher_name,
      });
    }
  
    try {
      await axios.post("http://localhost:5000/schedule/add", {
        events: eventsToAdd,
      });
  
      alert("Schedule added successfully!");
  
      // Update the calendar with the new events
      setEvents((prevEvents) => [
        ...prevEvents,
        ...eventsToAdd.map((e) => ({
          id: Date.now().toString(), // Temporary unique ID
          title: `${e.subject} (${e.teacher_name})`,
          start: `${e.date}T${e.start_time}`,
          end: `${e.date}T${e.end_time}`,
        })),
      ]);
  
      setModalOpen(false);
    } catch (err) {
      alert("Failed to add schedule.");
      console.error("Error adding schedule:", err);
    }
  };
  

  
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-50">
        Set Schedule
      </h2>
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


      
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 text-sm">
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
          slotMinTime="08:00:00" // Start time at 8 AM
          slotMaxTime="19:00:00" // End time at 6 PM
          height="auto"
          className="rounded-md overflow-hidden text-gray-50"
          eventClick={handleEventClick}
        />
      </div>

      {modalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
            {/* If no event is selected, show the Add Schedule form */}
            {!selectedEvent ? (
              <>
                <h3 className="text-2xl font-bold text-gray-50 mb-4">
                  Add Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Selected Phase Box */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Selected Phase:
                    </label>
                    <input
                      type="text"
                      value={
                        phase === "phase1"
                          ? "Phase 1"
                          : phase === "phase2"
                          ? "Phase 2"
                          : phase === "phase3_p1"
                          ? "Phase 3 Part 1"
                          : phase === "phase3_p2"
                          ? "Phase 3 Part 2"
                          : "Unknown Phase"
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
                    />
                  </div>

                  {/* Date Field */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Date:
                    </label>
                    <input
                      type="text"
                      value={selectedDate.split("T")[0]}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
                    />
                  </div>

                  {/* Start Time Field */}
                  <div>
                    
                    <label className="block mb-2 font-semibold text-gray-400">Start Time:</label>
                    <input
                      type="time" // Change input type to 'time' for better time selection
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)} // Update the selectedTime state
                      className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Duration (minutes):
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-4"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Subject:
                    </label>
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
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Faculty:
                    </label>
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
                  </div>

              
                  {/* Lecture Type */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Lecture Type:
                    </label>
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
                  </div>

                  {/* Repetitive Weeks */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-400">
                      Repetitive Weeks:
                    </label>
                    <input
                      type="number"
                      name="repeat_weeks"
                      min="1"
                      value={formData.repeat_weeks || 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          repeat_weeks: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-300 mb-6"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
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
              </>
            ) : (
              <>
                {/* Tabs for Update/Delete */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setSelectedTab("update")}
                    className={`${
                      selectedTab === "update" ? "bg-blue-500" : "bg-gray-700"
                    } text-white px-4 py-2 rounded-md`}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setSelectedTab("delete")}
                    className={`${
                      selectedTab === "delete" ? "bg-blue-500" : "bg-gray-700"
                    } text-white px-4 py-2 rounded-md`}
                  >
                    Delete
                  </button>
                </div>

                {selectedTab === "update" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          Phase:
                        </label>
                        <input
                          type="text"
                          value={
                            phase === "phase1"
                              ? "Phase 1"
                              : phase === "phase2"
                              ? "Phase 2"
                              : phase === "phase3_p1"
                              ? "Phase 3 Part 1"
                              : phase === "phase3_p2"
                              ? "Phase 3 Part 2"
                              : "Unknown Phase"
                          }
                          readOnly
                          className="px-3 py-2 bg-gray-900 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          Selected Subject:
                        </label>
                        <input
                          type="text"
                          value={selectedEvent.title.split(" (")[0]}
                          readOnly
                          className="px-3 py-2 bg-gray-900 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          Selected Faculty:
                        </label>
                        <input
                          type="text"
                          value={selectedEvent.title
                            .split(" (")[1]
                            .replace(/\)$/, "")}
                          readOnly
                          className="px-3 py-2 bg-gray-900 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          Date:
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="px-3 py-2 bg-gray-900 rounded-md"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          Start Time:
                        </label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              start_time: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-gray-900 rounded-md"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-gray-400">
                          End Time:
                        </label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              end_time: e.target.value,
                            })
                          }
                          className="px-3 py-2 bg-gray-900 rounded-md text-gray-300"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={handleUpdate}
                        className="bg-blue-500 px-4 py-2 rounded-md"
                      >
                        Update Event
                      </button>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="bg-red-500 px-4 py-2 rounded-md"
                      >
                        Go Back
                      </button>
                    </div>
                  </>
                )}

                {selectedTab === "delete" && (
                  <>
                    <p className="text-gray-300 mb-4">
                      Are you sure you want to delete this event?
                    </p>
                    <div className="flex justify-between">
                      <button
                        onClick={handleDelete}
                        className="bg-red-500 px-4 py-2 rounded-md"
                      >
                        Delete Event
                      </button>
                      <button
                        onClick={() => setModalOpen(false)}
                        className="bg-gray-700 px-4 py-2 rounded-md"
                      >
                        Go Back
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
