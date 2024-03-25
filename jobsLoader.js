// This function fetches the XML data
function fetchXMLData(url) {
    return fetch(url)
      .then(response => response.text())
      .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"));
  }
  
  // This function processes the XML and returns job listings by category
function processXML(xml) {
    const positions = xml.getElementsByTagName('position');
    const categories = {};
  
    // Loop through each position and categorize
    for (let position of positions) {
      const id = position.getElementsByTagName('id')[0].textContent;
      const category = position.getElementsByTagName('department')[0].textContent;
      const title = position.getElementsByTagName('name')[0].textContent;
      const employmentType = position.getElementsByTagName('employmentType')[0].textContent;
      const location = position.getElementsByTagName('office')[0].textContent;
      const recruitingCategory = position.getElementsByTagName('recruitingCategory')[0].textContent;
      const schedule = position.getElementsByTagName('schedule')[0].textContent; // Capture schedule information
  
      // Create category if it doesn't exist
      if (!categories[category]) {
        categories[category] = [];
      }
  
      // Add job to the category
      categories[category].push({ id, title, employmentType, location, recruitingCategory, schedule });
    }
  
    return categories;
  }
  
  // This function generates HTML for the categories
  function generateHTMLForCategories(categories) {
    let html = '';
  
    for (let category in categories) {
      html += `<div class="accordion-item">
                 <div class="accordion-item-trigger" style="background-color: rgb(104, 111, 125);">
                   <h4 p_type-of-employment-text class="text-size-regular">${category}</h4>
                   <div class="quantity_wrapper">
                     <div>${categories[category].length} Jobs</div>
                     <!-- Add accordion icon here -->
                     <div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 25" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                            <path d="M8.5 14.8855L12.5 10.8855L16.5 14.8855" stroke="currentColor" stroke-width="1.54" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg></div>
                   </div>
                 </div>
                 <div class="accordion-item-content">
                   ${categories[category].map(job => `
                     <a href="https://twaice.jobs.personio.com/job/${job.id}?language=de&display=en" class="accordion_list w-inline-block">
                       <div>
                         <h4 class="heading-small text-weight-normal">${job.title}</h4>
                         <div class="accordion_list-inner">
                         <div class="text-size-small">${job.recruitingCategory}</div>
                         <div class="text-size-small">,  </div>
                         <div class="text-size-small is-fest">${job.schedule}</div> <!-- Include schedule here -->
                         <div class="text-size-small">, </div>
                           <div p_location-filter-text class="text-size-small is-job">${job.location}</div>
                         </div>
                       </div>
                       <div class="icon-embed-xsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 25" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M23.251 12.3826C23.251 6.16936 18.2142 1.13257 12.001 1.13257C5.78777 1.13257 0.750977 6.16936 0.750977 12.3826C0.750977 18.5958 5.78777 23.6326 12.001 23.6326C18.2142 23.6326 23.251 18.5958 23.251 12.3826Z" fill="#1562FC"></path>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1941 12.0955C17.1575 12.007 17.1032 11.9241 17.0313 11.8522L13.2813 8.10224C12.9884 7.80935 12.5135 7.80935 12.2206 8.10224C11.9278 8.39513 11.9278 8.87001 12.2206 9.1629L14.6903 11.6326H7.50098C7.08676 11.6326 6.75098 11.9684 6.75098 12.3826C6.75098 12.7968 7.08676 13.1326 7.50098 13.1326H14.6903L12.2206 15.6022C11.9278 15.8951 11.9278 16.37 12.2206 16.6629C12.5135 16.9558 12.9884 16.9558 13.2813 16.6629L17.0313 12.9129C17.1778 12.7665 17.251 12.5745 17.251 12.3826C17.251 12.2809 17.2307 12.1839 17.1941 12.0955Z" fill="white"></path>
                        </svg></div>
                     </a>
                   `).join('')}
                 </div>
               </div>`;
    }
  
    return html;
  }
  
  
  // This function inserts the HTML into the DOM
  function insertHTMLIntoDOM(html) {
    const nestElement = document.querySelector('[p_nest]');
    nestElement.innerHTML = html;
  }

 // This function populates the select fields for both type of employment and location
function populateFilters(categories) {
    const typeSelectField = document.querySelector('[p_type-of-employment]');
    const locationSelectField = document.querySelector('[p_location-filter]');
    const locations = new Set();
  
    // Populate type of employment select field
    if (typeSelectField) {
      for (let category in categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        typeSelectField.appendChild(option);
      }
    } else {
      console.error('Select field with [p_type-of-employment] not found.');
    }
  
    // Collect locations from each category to populate location select field
    Object.values(categories).forEach(category => {
      category.forEach(job => {
        locations.add(job.location); // Assuming 'location' is a property of job
      });
    });
  
    // Ensure the location select field exists
    if (locationSelectField) {
      locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelectField.appendChild(option);
      });
    } else {
      console.error('Select field with [p_location-filter] not found.');
    }
  }
  
  function applyFilters() {
    const selectedType = document.querySelector('[p_type-of-employment]').value.trim();
    const selectedLocation = document.querySelector('[p_location-filter]').value.trim();

    let totalVisibleJobs = 0; // Track the total number of visible jobs after filtering

    const allAccordions = document.querySelectorAll('.accordion-item');
    allAccordions.forEach(accordion => {
        let visibleJobs = 0;

        const category = accordion.querySelector('[p_type-of-employment-text]').textContent.trim();
        const jobs = accordion.querySelectorAll('.accordion_list');

        jobs.forEach(job => {
            const jobLocation = job.querySelector('[p_location-filter-text]').textContent.trim();

            if ((selectedType === '' || category.toLowerCase() === selectedType.toLowerCase()) && 
                (selectedLocation === '' || jobLocation.toLowerCase().includes(selectedLocation.toLowerCase()))) {
                job.style.display = '';
                visibleJobs++;
            } else {
                job.style.display = 'none';
            }
        });

        // Update accordion visibility, job counts, and toggle is-open classes based on visibility
        accordion.style.display = visibleJobs > 0 ? '' : 'none';
        const jobCountDiv = accordion.querySelector('.quantity_wrapper div');
        jobCountDiv.textContent = `${visibleJobs} Jobs`;

        // Toggle is-open class based on if jobs are visible or not
        const trigger = accordion.querySelector('.accordion-item-trigger');
        const content = accordion.querySelector('.accordion-item-content');
        const icon = accordion.querySelector('.icon-embed-xsmall');

        if (visibleJobs > 0) {
            // Ensure accordion is marked as open
            if(trigger && !trigger.classList.contains('is-open')) trigger.classList.add('is-open');
            if(content && !content.classList.contains('is-open')) content.classList.add('is-open');
            if(icon && !icon.classList.contains('is-open')) icon.classList.add('is-open');
        } else {
            // Ensure accordion is marked as closed
            if(trigger && trigger.classList.contains('is-open')) trigger.classList.remove('is-open');
            if(content && content.classList.contains('is-open')) content.classList.remove('is-open');
            if(icon && icon.classList.contains('is-open')) icon.classList.remove('is-open');
        }

        totalVisibleJobs += visibleJobs; // Update the total count of visible jobs
    });

    // Display the "No results found" message if there are no visible jobs after filtering
    const noResultsDiv = document.querySelector('.no_reults-found');
    if (totalVisibleJobs === 0) {
        noResultsDiv.style.display = 'block';
    } else {
        noResultsDiv.style.display = 'none';
    }
}



  
  
  document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for both filters
    const typeSelectField = document.querySelector('[p_type-of-employment]');
    const locationSelectField = document.querySelector('[p_location-filter]');
  
    if (typeSelectField && locationSelectField) {
      typeSelectField.addEventListener('change', applyFilters);
      locationSelectField.addEventListener('change', applyFilters);
    }
  
    // Fetch and process the XML, then populate the select fields and insert HTML into the DOM
    fetchXMLData('https://twaice.jobs.personio.com/xml')
      .then(xml => {
        const categories = processXML(xml);
        populateFilters(categories); // Updated to handle both filters
        const html = generateHTMLForCategories(categories);
        insertHTMLIntoDOM(html);
      })
      .catch(error => console.error('Error fetching or processing XML:', error));
  });
  
  

  document.addEventListener('DOMContentLoaded', (event) => {
    // Listen for clicks on the document
    document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent has the class 'accordion-item-trigger'
        let trigger = null;
        if (e.target.classList.contains('accordion-item-trigger')) {
            trigger = e.target;
        } else if (e.target.parentElement && e.target.parentElement.classList.contains('accordion-item-trigger')) {
            trigger = e.target.parentElement;
        }

        if (trigger) {
            // Toggle the 'is-open' class on the trigger itself
            trigger.classList.toggle('is-open');

            // Find the next sibling with the class 'accordion-item-content' and toggle 'is-open' on it
            const content = trigger.nextElementSibling;
            if (content) {
                content.classList.toggle('is-open');
            }

            // Find the icon within the trigger and toggle 'is-open' on it
            const icon = trigger.querySelector('.icon-embed-xsmall');
            if (icon) {
                icon.classList.toggle('is-open');
            }
        }
    });
});
