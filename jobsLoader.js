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
                       <!-- Add arrow icon here -->
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
  
  // Execute the functions
  fetchXMLData('https://twaice.jobs.personio.com/xml')
    .then(xml => {
      const categories = processXML(xml);
      const html = generateHTMLForCategories(categories);
      insertHTMLIntoDOM(html);
    })
    .catch(error => console.error('Error fetching or processing XML:', error));
  