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
  
      // Create category if it doesn't exist
      if (!categories[category]) {
        categories[category] = [];
      }
  
      // Add job to the category
      categories[category].push({ id, title, employmentType, location, recruitingCategory });
    }
  
    return categories;
  }
  
  // This function generates HTML for the categories
  function generateHTMLForCategories(categories) {
    let html = '';
  
    for (let category in categories) {
      html += `<div class="accordion-item">
                 <div class="accordion-item-trigger" style="background-color: rgb(104, 111, 125);">
                   <h4 class="text-size-regular">${category}</h4>
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
                           <div class="text-size-small">, </div>
                           <div class="text-size-small is-job">${job.location}</div>
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

 // This function populates the type of employment select field
function populateEmploymentTypeSelectField(categories) {
  const selectField = document.querySelector('[p_type-of-employment]');
  // Ensure the select field exists
  if (selectField) {
    for (let category in categories) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      selectField.appendChild(option);
    }
  } else {
    console.error('Select field with [p_type-of-employment] not found.');
  }
}

// This function filters job listings by the selected category
function filterJobListingsByCategory(selectedCategory) {
    const allAccordions = document.querySelectorAll('.accordion-item');
    allAccordions.forEach(accordion => {
      // Extract the category title text
      const categoryTitle = accordion.querySelector('.accordion-item-trigger h4').textContent;
  
      // Compare the accordion's category with the selected category and show/hide accordingly
      if (!selectedCategory || categoryTitle === selectedCategory) {
        accordion.style.display = '';
      } else {
        accordion.style.display = 'none';
      }
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const selectField = document.querySelector('[p_type-of-employment]');
  
    if (selectField) {
      // Add the event listener to the select field for the 'change' event
      selectField.addEventListener('change', function(e) {
        // Call the filter function with the new selected value
        filterJobListingsByCategory(e.target.value);
      });
    }
  
    // Fetch and process the XML, then populate the select field and insert HTML into the DOM
    fetchXMLData('https://twaice.jobs.personio.com/xml')
      .then(xml => {
        const categories = processXML(xml);
        populateEmploymentTypeSelectField(categories); // Call this only after the select field is guaranteed to exist
        const html = generateHTMLForCategories(categories);
        insertHTMLIntoDOM(html);
      })
      .catch(error => console.error('Error fetching or processing XML:', error));
  });
  

    document.addEventListener('DOMContentLoaded', (event) => {
        // Listen for clicks on the document
        document.addEventListener('click', function(e) {
          // Check if the clicked element has the class 'accordion-item-trigger'
          if (e.target.classList.contains('accordion-item-trigger')) {
            // Find the next sibling with the class 'accordion-item-content'
            const content = e.target.nextElementSibling;
            
            // Toggle the 'is-open' class on the content
            if (content) {
              content.classList.toggle('is-open');
            }
          }
        });
      });  