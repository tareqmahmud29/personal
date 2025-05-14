document.addEventListener('DOMContentLoaded', function() {
  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  
  // DOM Elements
  const routineForm = document.getElementById('routineForm');
  const subjectInput = document.getElementById('subject');
  const timeInput = document.getElementById('time');
  const daysContainer = document.getElementById('days');
  const selectedDaysInput = document.getElementById('selectedDays');
  const prioritySelect = document.getElementById('priority');
  const notesInput = document.getElementById('notes');
  const routineList = document.querySelector('.routine-days');
  const downloadPdfBtn = document.getElementById('downloadPdf');
  const clearAllBtn = document.getElementById('clearAll');
  
  // Selected days array
  let selectedDays = [];
  
  // Day buttons event listeners
  daysContainer.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const day = this.value;
      
      if (this.classList.contains('active')) {
        if (!selectedDays.includes(day)) {
          selectedDays.push(day);
        }
      } else {
        selectedDays = selectedDays.filter(d => d !== day);
      }
      
      selectedDaysInput.value = selectedDays.join(',');
    });
  });
  
  // Form submission
  routineForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }
    
    const subject = subjectInput.value.trim();
    const time = timeInput.value.trim();
    const priority = prioritySelect.value;
    const notes = notesInput.value.trim();
    
    // Add session to each selected day
    selectedDays.forEach(day => {
      addSessionToDay(day, subject, time, priority, notes);
    });
    
    // Reset form
    routineForm.reset();
    daysContainer.querySelectorAll('.day-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    selectedDays = [];
    selectedDaysInput.value = '';
  });
  
  // Add session to a specific day
  function addSessionToDay(day, subject, time, priority, notes) {
    // Check if day column already exists
    let dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
    
    if (!dayColumn) {
      // Create new day column
      dayColumn = document.createElement('div');
      dayColumn.className = 'day-column';
      dayColumn.dataset.day = day;
      
      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';
      dayHeader.innerHTML = `
        <span>${day}</span>
        <button class="clear-day" data-day="${day}"><i class="fas fa-times"></i></button>
      `;
      
      dayColumn.appendChild(dayHeader);
      routineList.appendChild(dayColumn);
      
      // Add event listener to clear day button
      dayHeader.querySelector('.clear-day').addEventListener('click', function() {
        dayColumn.remove();
      });
    }
    
    // Create session item
    const sessionItem = document.createElement('div');
    sessionItem.className = `session-item ${priority}`;
    sessionItem.innerHTML = `
      <div class="session-subject">${subject}</div>
      <div class="session-time"><i class="far fa-clock"></i> ${time}</div>
      ${notes ? `<div class="session-notes">${notes}</div>` : ''}
      <div class="session-actions">
        <button class="edit-session"><i class="far fa-edit"></i></button>
        <button class="delete-session"><i class="far fa-trash-alt"></i></button>
      </div>
    `;
    
    // Add session to the day column
    dayColumn.appendChild(sessionItem);
    
    // Add event listeners to action buttons
    sessionItem.querySelector('.delete-session').addEventListener('click', function() {
      sessionItem.remove();
      // If day column is empty after deletion, remove it
      if (dayColumn.querySelectorAll('.session-item').length === 0) {
        dayColumn.remove();
      }
    });
    
    // Edit functionality would go here
    sessionItem.querySelector('.edit-session').addEventListener('click', function() {
      // For simplicity, we'll just populate the form with this session's data
      subjectInput.value = subject;
      timeInput.value = time;
      prioritySelect.value = priority;
      notesInput.value = notes;
      
      // Set the days
      selectedDays = [day];
      selectedDaysInput.value = day;
      
      // Update day buttons
      daysContainer.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', btn.value === day);
      });
      
      // Remove the session item
      sessionItem.remove();
    });
  }
  
  // Download PDF functionality
  downloadPdfBtn.addEventListener('click', function() {
    if (routineList.children.length === 0) {
      alert('Your routine is empty. Add some sessions first!');
      return;
    }
    
    const doc = new jsPDF();
    let yPos = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(67, 97, 238);
    doc.text('My Study Routine', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated on ' + new Date().toLocaleDateString(), 105, yPos, { align: 'center' });
    yPos += 20;
    
    // Add each day's sessions
    const dayColumns = routineList.querySelectorAll('.day-column');
    
    dayColumns.forEach(dayColumn => {
      const day = dayColumn.dataset.day;
      const sessions = dayColumn.querySelectorAll('.session-item');
      
      // Add day header
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text(day + ':', 20, yPos);
      yPos += 10;
      
      // Add each session
      sessions.forEach(session => {
        if (yPos > 250) { // Add new page if we're near the bottom
          doc.addPage();
          yPos = 20;
        }
        
        const subject = session.querySelector('.session-subject').textContent;
        const time = session.querySelector('.session-time').textContent;
        const notesEl = session.querySelector('.session-notes');
        const notes = notesEl ? notesEl.textContent : '';
        const priority = session.classList.contains('high') ? 'High' : 
                        session.classList.contains('medium') ? 'Medium' : 'Low';
        
        // Set color based on priority
        if (priority === 'High') doc.setTextColor(244, 67, 54);
        else if (priority === 'Medium') doc.setTextColor(255, 152, 0);
        else doc.setTextColor(76, 175, 80);
        
        doc.setFontSize(12);
        doc.text(`• ${subject} (${priority})`, 25, yPos);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(time, 25, yPos + 7);
        
        if (notes) {
          const splitNotes = doc.splitTextToSize(notes, 170);
          doc.text(splitNotes, 25, yPos + 14);
          yPos += splitNotes.length * 7;
        }
        
        yPos += 20;
      });
      
      yPos += 10;
    });
    
    // Save the PDF
    doc.save('Study_Routine_' + new Date().toISOString().slice(0, 10) + '.pdf');
  });
  
  // Clear all routine
  clearAllBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear your entire routine?')) {
      routineList.innerHTML = '';
    }
  });
  
  // Initialize with empty message if no sessions
  updateEmptyMessage();
  
  function updateEmptyMessage() {
    if (routineList.children.length === 0) {
      routineList.innerHTML = `
        <div class="empty-routine">
          <i class="far fa-calendar-plus" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
          <p>Your routine is empty. Add your first study session to get started!</p>
        </div>
      `;
    }
  }
});