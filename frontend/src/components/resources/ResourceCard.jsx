import { Clock, User, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Content generators for different resource types
const generateRubricContent = (title) => {
  return `# ${title}

## Assessment Criteria and Scoring Guide

### Overall Score: _____ / 100 points

---

## 1. Musical Composition Quality (25 points)

**Excellent (23-25 points)**
- Demonstrates exceptional creativity and originality
- Shows sophisticated understanding of musical elements
- Composition is highly engaging and well-structured
- Clear artistic vision throughout

**Proficient (18-22 points)**  
- Good creative ideas with solid musical foundation
- Generally effective use of musical elements
- Composition maintains listener interest
- Some evidence of artistic planning

**Developing (13-17 points)**
- Basic musical ideas present but limited development
- Inconsistent use of musical elements
- Composition lacks cohesion or direction
- Limited evidence of creative planning

**Beginning (0-12 points)**
- Minimal musical content or development
- Poor understanding of basic musical elements
- Composition is difficult to follow or understand
- Little to no evidence of creative effort

**Score: _____ / 25**

---

## 2. AI Tool Integration (25 points)

**Excellent (23-25 points)**
- Sophisticated and thoughtful use of AI composition tools
- Critical evaluation of AI suggestions with selective implementation
- AI assists rather than replaces human creativity
- Clear understanding of AI capabilities and limitations

**Proficient (18-22 points)**
- Effective use of AI tools to enhance composition
- Good balance between AI assistance and personal input
- Generally appropriate selection of AI suggestions
- Basic understanding of AI tool functions

**Developing (13-17 points)**
- Limited or superficial use of AI tools
- Accepting AI suggestions without critical evaluation
- Over-reliance on AI with minimal personal contribution
- Unclear understanding of AI tool purposes

**Beginning (0-12 points)**
- Minimal or no use of available AI tools
- Inappropriate or ineffective AI tool usage
- No evidence of understanding AI capabilities
- AI tools used as substitutes for learning

**Score: _____ / 25**

---

## 3. Spatial Audio Implementation (25 points)

**Excellent (23-25 points)**
- Creative and musically effective spatial positioning
- Spatial audio clearly enhances the musical experience
- Sophisticated understanding of 3D audio concepts
- Innovative use of spatial effects and movement

**Proficient (18-22 points)**
- Good spatial positioning that supports the music
- Clear understanding of basic spatial audio principles
- Effective use of stereo field and depth
- Appropriate spatial choices for musical content

**Developing (13-17 points)**
- Basic spatial positioning with limited effectiveness
- Some understanding of spatial audio concepts
- Inconsistent or inappropriate spatial choices
- Spatial audio doesn't significantly enhance music

**Beginning (0-12 points)**
- Poor or no use of spatial audio capabilities
- Spatial positioning detracts from musical experience
- No evidence of understanding spatial audio concepts
- Random or inappropriate placement of elements

**Score: _____ / 25**

---

## 4. Technical Execution and Presentation (25 points)

**Excellent (23-25 points)**
- Flawless technical execution with professional quality
- Clear, engaging, and well-organized presentation
- Excellent use of supporting materials and demonstrations
- Strong communication and explanation of creative choices

**Proficient (18-22 points)**
- Good technical execution with minor issues
- Clear and organized presentation of work
- Appropriate use of supporting materials
- Adequate explanation of creative process

**Developing (13-17 points)**
- Acceptable technical execution with some problems
- Basic presentation with minimal organization
- Limited use of supporting materials
- Unclear explanation of creative choices

**Beginning (0-12 points)**
- Poor technical execution with major problems
- Unclear or disorganized presentation
- No supporting materials or demonstrations
- Little to no explanation of creative process

**Score: _____ / 25**

---

## Additional Assessment Categories

### Collaboration (if applicable)
- [ ] Excellent teamwork and shared responsibilities
- [ ] Good communication and compromise skills
- [ ] Fair contribution from all team members
- [ ] Effective conflict resolution when needed

### Innovation and Risk-Taking
- [ ] Willingness to experiment with new techniques
- [ ] Creative problem-solving approach
- [ ] Original ideas beyond basic requirements
- [ ] Thoughtful artistic risks that enhance the work

### Reflection and Learning
- [ ] Clear articulation of learning process
- [ ] Honest self-assessment of strengths and challenges
- [ ] Evidence of growth throughout the project
- [ ] Meaningful connections to course concepts

---

## Overall Comments and Feedback

**Strengths:**


**Areas for Improvement:**


**Suggestions for Future Work:**


**Grade: _____ / 100**

---

**Instructor:** ________________________  **Date:** ____________

This rubric assesses student work in AI-assisted music composition with spatial audio integration. Adjust criteria as needed for specific assignments and learning objectives.`;
};

const generateChecklistContent = (title) => {
  return `# ${title}

## Pre-Project Checklist

### Technical Setup
- [ ] Spatial AI Platform account created and verified
- [ ] Audio equipment tested (headphones/speakers)
- [ ] Computer audio drivers updated and functioning
- [ ] Internet connection stable for online tools
- [ ] File storage organized for project materials

### Software Preparation  
- [ ] Spatial audio interface tutorial completed
- [ ] AI composition tools explored and tested
- [ ] Recording software installed (if needed)
- [ ] Project template or starting file created
- [ ] Backup storage system established

---

## Project Development Checklist

### Planning Phase
- [ ] Project concept clearly defined
- [ ] Musical goals and objectives established
- [ ] Target audience identified
- [ ] Genre and style parameters set
- [ ] Timeline with milestones created
- [ ] Team roles assigned (if collaborative project)

### Composition Phase
- [ ] Initial melodic ideas generated using AI tools
- [ ] Harmonic progressions tested and selected  
- [ ] Musical form and structure planned
- [ ] Instrumentation choices made
- [ ] Key, tempo, and time signature confirmed
- [ ] Spatial positioning strategy developed

### Technical Implementation
- [ ] Audio sources recorded or selected
- [ ] Spatial positioning applied to all elements
- [ ] Volume levels balanced appropriately
- [ ] Spatial effects tested and refined
- [ ] Different playback systems tested
- [ ] Technical issues documented and resolved

### Quality Control
- [ ] Composition played through completely
- [ ] All sections transition smoothly
- [ ] Spatial audio enhances rather than distracts
- [ ] AI-generated elements integrate naturally
- [ ] Overall musical coherence maintained
- [ ] Target duration achieved

---

## Pre-Submission Checklist

### File Organization
- [ ] Final composition file saved in required format
- [ ] Project documentation completed
- [ ] Supporting materials organized
- [ ] File names follow naming conventions
- [ ] All required files included in submission folder
- [ ] Backup copies created and stored safely

### Technical Verification
- [ ] Final composition plays without errors
- [ ] Spatial audio positioning functions correctly
- [ ] Volume levels appropriate for presentation
- [ ] Compatible with required playback systems
- [ ] File compression and quality appropriate
- [ ] Loading time acceptable for presentation

### Documentation Requirements
- [ ] Project reflection essay completed
- [ ] AI tool usage documented with examples
- [ ] Spatial audio decisions explained
- [ ] Creative process timeline included
- [ ] Challenges and solutions described
- [ ] Learning outcomes articulated

---

## Presentation Checklist

### Preparation
- [ ] Presentation outline created
- [ ] Key points and examples identified
- [ ] Technical demonstration planned
- [ ] Visual aids prepared (if required)
- [ ] Timing rehearsed and appropriate
- [ ] Q&A responses prepared

### Technical Setup for Presentation
- [ ] Spatial audio system tested in presentation space
- [ ] Backup playback method available
- [ ] Volume levels appropriate for room
- [ ] All files accessible and ready
- [ ] Technical support contact identified
- [ ] Contingency plan prepared for technical issues

### Content Organization
- [ ] Introduction clearly states project goals
- [ ] Composition demonstration highlights key features
- [ ] AI tool usage explained with examples
- [ ] Spatial audio effects demonstrated effectively
- [ ] Creative process reflection included
- [ ] Conclusion summarizes learning outcomes

---

## Post-Project Checklist

### Reflection and Assessment
- [ ] Self-assessment completed honestly
- [ ] Peer feedback collected and reviewed
- [ ] Instructor feedback incorporated into reflection
- [ ] Learning goals achievement evaluated
- [ ] Future improvement areas identified
- [ ] Portfolio materials updated

### File Management
- [ ] Final project files archived appropriately
- [ ] Working files organized for future reference
- [ ] Shared resources properly credited
- [ ] Temporary files cleaned up
- [ ] Version control maintained
- [ ] Access permissions updated as needed

### Knowledge Transfer
- [ ] Key techniques documented for future use
- [ ] Successful strategies noted and described
- [ ] Problem-solving approaches recorded
- [ ] Tool preferences and settings saved
- [ ] Collaboration lessons learned documented
- [ ] Resource recommendations compiled

---

## Troubleshooting Quick Reference

### Common Technical Issues
**Audio Not Playing:**
- [ ] Check audio output device settings
- [ ] Verify file format compatibility  
- [ ] Test with different audio sources
- [ ] Restart audio drivers if necessary

**Spatial Effects Not Working:**
- [ ] Confirm headphones/speakers support spatial audio
- [ ] Check spatial positioning settings
- [ ] Verify Web Audio API compatibility
- [ ] Test with known working spatial audio examples

**AI Tools Not Responding:**
- [ ] Check internet connection
- [ ] Verify account permissions and login
- [ ] Clear browser cache and cookies
- [ ] Try different browser or device

**File Corruption or Loss:**
- [ ] Check backup storage locations
- [ ] Attempt file recovery tools
- [ ] Contact technical support
- [ ] Reconstruct from available materials

---

## Emergency Contacts

**Technical Support:** [Platform help desk contact]
**Instructor:** [Contact information]  
**IT Department:** [School IT support]
**Peer Mentors:** [Student helper contacts]

---

**Project Checklist Version:** 2.0
**Last Updated:** November 2024
**Compatible with:** Spatial AI Platform v1.0+`;
};

const generateGuidelinesContent = (title) => {
  return `# ${title}

## Core Principles of Academic Integrity

Academic integrity is fundamental to meaningful learning and fair assessment. These guidelines help ensure that your work with AI tools and collaborative projects maintains the highest ethical standards.

---

## 1. Understanding AI Assistance vs. Academic Dishonesty

### Appropriate AI Usage
**Encouraged:**
- Using AI tools to generate initial creative ideas for development
- Seeking AI suggestions for harmonic progressions or melodic variations  
- Employing AI to overcome creative blocks or explore new directions
- Using AI to learn about musical techniques and approaches
- Applying AI feedback to improve technical execution

**Clear Attribution Required:**
- Any AI-generated material included in final work
- Specific AI tools and settings used
- Extent of AI contribution to the creative process
- Personal modifications made to AI suggestions
- Rationale for accepting or rejecting AI recommendations

### Prohibited AI Usage
**Not Permitted:**
- Submitting AI-generated work as entirely your own creation
- Using AI to complete assignments without substantial personal contribution
- Failing to disclose AI assistance when required
- Using AI to bypass learning objectives or skill development
- Copying AI output without understanding or personal input

---

## 2. Collaboration Guidelines

### Appropriate Collaboration
**Encouraged in Group Projects:**
- Sharing creative ideas and constructive feedback
- Dividing tasks based on individual strengths and interests
- Supporting team members with technical or creative challenges
- Engaging in respectful creative dialogue and compromise
- Contributing fairly to shared objectives

**Individual Responsibility in Teams:**
- Each member must contribute meaningfully to the project
- Individual work quality should be identifiable within team output
- Personal learning objectives must be met regardless of team dynamics
- Honest communication about capabilities and availability
- Accountability for assigned responsibilities and deadlines

### Prohibited Collaboration Practices
**Not Permitted:**
- Allowing others to complete your assigned work
- Claiming credit for work you did not meaningfully contribute to
- Sharing individual assignment solutions as your own work
- Plagiarizing from team members' individual contributions
- Misrepresenting individual contributions in team assessments

---

## 3. Attribution and Source Documentation

### Required Documentation
**For All Projects:**
- Complete list of AI tools used with version information
- Detailed description of AI assistance received
- Documentation of personal contributions and modifications
- Clear distinction between AI-generated and original material
- References to any external musical sources

**AI Tool Attribution Format:**

AI Tool: [Name and Version]
Usage: [Specific application, e.g., "melody generation in measures 12-16"]
Input Parameters: [Settings or prompts used]
Output: [Brief description of AI suggestion]
Personal Modification: [How you changed or developed the AI output]
Rationale: [Why you chose to use/modify this AI suggestion]

### Citation Standards
**Musical Sources:**
- Composer, piece title, and performance information
- Influence or inspiration drawn from the source
- Specific elements borrowed or adapted
- Permission status for copyrighted materials

**Technical Resources:**
- Software tools and versions used
- Online tutorials or guides consulted
- Technical assistance received from others
- Hardware or equipment specifications

---

## 4. Original Work Standards

### What Constitutes Original Work
**Your Original Contribution Must Include:**
- Creative decision-making about musical direction
- Personal evaluation and modification of AI suggestions
- Individual artistic vision and expression
- Technical implementation and problem-solving
- Critical reflection on the creative process

**Demonstrating Originality:**
- Document your creative process with notes or recordings
- Show multiple iterations and refinements of ideas
- Explain artistic choices and their musical justification
- Demonstrate understanding of techniques used
- Connect work to personal musical experience and knowledge

### Building on Existing Work
**Acceptable:**
- Using traditional musical forms and harmonic progressions
- Building on well-established compositional techniques
- Drawing inspiration from existing musical styles
- Incorporating common musical elements as foundations

**Requires Attribution:**
- Specific melodic or rhythmic quotations from other works
- Distinctive harmonic progressions from identifiable sources
- Stylistic imitations of specific composers or pieces
- Arrangements or variations of existing compositions

---

## 5. Assessment and Evaluation Guidelines

### Self-Assessment Expectations
**Honest Self-Evaluation:**
- Accurate reporting of individual contributions in team projects
- Realistic assessment of learning objectives achieved
- Identification of challenges faced and solutions attempted
- Recognition of areas needing continued development
- Appreciation for growth experienced during the project

**Reflection Requirements:**
- Process documentation showing creative development
- Analysis of AI tool effectiveness and limitations
- Discussion of creative decisions and their musical outcomes
- Evaluation of collaborative experiences and lessons learned
- Connection of project work to broader learning goals

### Peer Assessment Responsibilities
**Fair and Constructive Feedback:**
- Focus on observable contributions and musical outcomes
- Provide specific examples rather than general impressions
- Balance positive recognition with constructive suggestions
- Respect different creative approaches and musical preferences
- Maintain confidentiality of peer assessment discussions

---

## 6. Violation Reporting and Resolution

### Recognizing Violations
**Potential Academic Integrity Issues:**
- Unexplained sudden improvements in work quality or sophistication
- Work that doesn't reflect demonstrated knowledge or skill level
- Inconsistencies between individual and group work quality
- Missing or inadequate documentation of AI assistance
- Identical or suspiciously similar work between students

### Reporting Process
**If You Witness Violations:**
1. Document specific observations objectively
2. Consult with instructor privately about concerns
3. Allow opportunity for clarification or correction
4. Maintain confidentiality throughout process
5. Focus on supporting academic integrity rather than punishment

**If You're Accused of Violations:**
1. Provide complete documentation of your work process
2. Explain your use of AI tools and collaborative contributions
3. Demonstrate understanding of concepts through discussion
4. Accept responsibility for any oversights in attribution
5. Work with instructor to prevent future misunderstandings

---

## 7. Technology and Privacy Considerations

### Data Privacy
**Protecting Your Work:**
- Understand AI platform data usage policies
- Avoid sharing sensitive personal information
- Use privacy settings appropriately on collaboration platforms
- Keep backup copies of work in secure locations
- Be aware of data retention policies for online tools

**Respecting Others' Privacy:**
- Don't share others' creative work without permission
- Respect confidentiality in peer review processes
- Avoid including personal information about others in your work
- Follow platform guidelines for sharing and collaboration

### Technical Ethics
**Responsible Technology Use:**
- Use institutional resources appropriately and efficiently
- Report technical problems or security concerns promptly
- Avoid circumventing security or access restrictions
- Respect software licensing and usage agreements
- Consider environmental impact of computing resource usage

---

## 8. Long-term Learning Objectives

### Developing Ethical Creative Practices
**Beyond the Classroom:**
- Build habits of honest attribution and documentation
- Develop critical evaluation skills for AI assistance
- Cultivate authentic creative voice while leveraging technology
- Understand professional standards in music and creative industries
- Prepare for ethical decision-making in future creative work

### Professional Preparation
**Industry Standards:**
- Understand copyright and intellectual property in music
- Develop collaboration skills valued in professional settings
- Build reputation for ethical practice and reliable teamwork
- Learn to balance efficiency with artistic integrity
- Prepare for evolving role of AI in creative industries

---

## Resources for Further Guidance

### Institutional Support
- Academic integrity office contact information
- Student counseling and support services
- Technical help desk for platform and software issues
- Writing center assistance for documentation and attribution
- Student mediation services for collaboration conflicts

### Educational Resources
- Institution's academic integrity policy handbook
- Professional organizations' ethical guidelines for musicians
- Current research on AI in creative fields
- Legal resources on copyright and fair use in music
- Ethics discussions in music education journals

---

## Summary

Academic integrity in AI-assisted creative work requires:
1. **Honest attribution** of all assistance received
2. **Meaningful personal contribution** to all submitted work  
3. **Fair collaboration** that supports everyone's learning
4. **Critical evaluation** of AI suggestions rather than blind acceptance
5. **Continuous learning** about ethical creative practices

Remember: The goal is not to avoid AI tools, but to use them ethically in ways that support genuine learning and creative development.

---

**Guidelines Version:** 2.1
**Effective Date:** November 2024  
**Review Date:** May 2025
**Approved by:** [Institution Name] Academic Integrity Committee`;
};

const generateSpatialExerciseContent = () => {
  return `# Spatial Audio Listening Exercise

## Exercise Overview
This structured 4-part exercise develops acute spatial hearing skills and understanding of audio positioning effects in 3D space.

**Duration:** 45-60 minutes  
**Equipment:** Headphones (required), quiet environment  
**Difficulty:** Intermediate  

## Part 1: Basic Spatial Awareness (15 minutes)

### Exercise 1A: Left-Right Positioning
1. Listen to the provided audio sample with stereo panning effects
2. Identify which ear hears each sound source more prominently
3. Rate the intensity of panning (0=center, 5=far left/right)
4. Document your observations

### Exercise 1B: Distance Perception
1. Play the distance simulation audio track
2. Identify which sounds appear closer vs. farther away
3. Note the audio characteristics that create distance illusion
4. Compare with and without headphones

## Part 2: Multi-Source Localization (15 minutes)

### Exercise 2A: Sound Source Counting
1. Listen to complex spatial scenes with multiple instruments
2. Count the number of distinct sound sources
3. Map their approximate positions (left/right, near/far)
4. Verify against provided source map

### Exercise 2B: Instrument Identification in Space
1. Identify each instrument in the spatial mix
2. Note each instrument's spatial position
3. Describe how spatial placement affects musical balance
4. Consider the compositional choices

## Part 3: Environmental Effects (10 minutes)

### Exercise 3A: Room Size Recognition
1. Listen to identical content in different simulated spaces
2. Identify: small room, medium hall, large cathedral
3. Note reverb characteristics and acoustic signatures
4. Describe emotional impact of each space

### Exercise 3B: Movement and Doppler
1. Experience sounds moving through 3D space
2. Track movement patterns (circular, linear, vertical)
3. Notice pitch changes during movement
4. Relate to real-world spatial audio experiences

## Part 4: Critical Analysis (15 minutes)

### Exercise 4A: Production Quality Assessment
1. Evaluate the realism of spatial positioning
2. Identify any artificial or unnatural elements
3. Suggest improvements for spatial placement
4. Compare to live acoustic experiences

### Exercise 4B: Creative Applications
1. Brainstorm educational uses for each spatial technique
2. Design a simple spatial audio scene for teaching
3. Consider accessibility and inclusion factors
4. Plan implementation in your classroom

## Reflection Questions

**Spatial Awareness:**
- Which spatial effects were most/least noticeable?
- How does spatial audio affect your emotional response?
- What challenges did you encounter during listening?

**Educational Applications:**
- How could spatial audio enhance your teaching?
- What concepts could be illustrated through spatial positioning?
- How might students with hearing differences experience this?

**Technical Understanding:**
- What makes spatial audio convincing or unconvincing?
- How does headphone quality affect the experience?
- What are the limitations of current spatial audio technology?

## Assessment Rubric

**Identification Accuracy (25%)**
- Correct identification of spatial positions
- Accurate counting of sound sources
- Recognition of environmental characteristics

**Critical Analysis (25%)**
- Thoughtful evaluation of spatial techniques
- Understanding of production methods
- Recognition of strengths and limitations

**Educational Application (25%)**
- Creative ideas for classroom implementation
- Consideration of diverse learning needs
- Practical and achievable suggestions

**Reflection Quality (25%)**
- Depth of personal response
- Connection to broader concepts
- Evidence of active listening engagement

## Resources and Next Steps

**Recommended Listening:**
- Binaural recordings of natural environments
- Classical music in spatial audio formats
- Experimental electronic spatial compositions
- Educational spatial audio demonstrations

**Further Exploration:**
- Visit spaces with interesting acoustics
- Experiment with basic spatial audio software
- Research spatial audio in different cultures
- Explore accessibility applications

**Technical Learning:**
- Basic principles of psychoacoustics
- Introduction to binaural recording techniques
- Overview of spatial audio production tools
- Standards for spatial audio formats

---
*Part of Spatial AI Platform Educational Resource Library*`;
};

const generateCollaborativeProjectContent = () => {
  return `# Collaborative Composition Project

## Project Overview
A comprehensive 4-6 week collaborative project where students create original music using AI tools and spatial audio techniques.

**Duration:** 4-6 weeks  
**Team Size:** 3-4 students  
**Final Product:** 3-5 minute spatial audio composition with documentation  

## Week 1: Planning and Setup

### Team Formation and Roles
**Required Roles:**
- **Compositional Director:** Oversees musical vision and AI tool usage
- **Spatial Audio Engineer:** Manages 3D positioning and environmental effects
- **Production Coordinator:** Handles recording, editing, and technical workflow
- **Documentation Lead:** Maintains project logs and creates presentation materials

### Project Planning Session
1. **Concept Development** (2 hours)
   - Brainstorm musical theme or narrative concept
   - Define target audience and intended emotional impact
   - Research reference works and inspirational materials
   - Create project timeline with milestones

2. **Technical Requirements Planning** (1 hour)
   - Inventory available tools and software
   - Plan recording needs (if using live instruments)
   - Establish file sharing and collaboration protocols
   - Set up project folder structure

### Deliverables Week 1:
- Team contract with roles and responsibilities
- Project concept statement (500 words)
- Technical specifications document
- Work timeline with individual assignments

## Week 2-3: Composition and Content Creation

### Musical Development Phase
**AI-Assisted Composition Process:**
1. Generate initial musical ideas using AI tools
2. Collaboratively refine and develop AI suggestions
3. Create complementary parts and arrangements
4. Document all AI assistance and human modifications

**Composition Requirements:**
- Minimum 8 distinct musical elements/tracks
- At least 3 different timbres or instrument types
- Clear musical structure (intro, development, climax, resolution)
- Evidence of collaborative decision-making

### Spatial Design Planning
**3D Audio Conceptualization:**
1. Map instrument positions in virtual space
2. Plan movement patterns and spatial changes
3. Design environmental acoustics (room size, reverb)
4. Consider listener perspective and experience flow

**Spatial Requirements:**
- Use of left/right positioning for at least 6 elements
- Implementation of distance effects (near/far)
- At least one element that moves through space
- Environmental reverb or acoustic simulation

### Weekly Check-ins:
- **Week 2 End:** Musical sketches and spatial concept maps
- **Week 3 End:** Complete musical composition with preliminary spatial implementation

## Week 4-5: Production and Refinement

### Technical Implementation
**Production Workflow:**
1. Import compositions into spatial audio software
2. Implement planned 3D positioning effects
3. Balance levels and apply processing effects
4. Create environmental acoustics and reverb

**Quality Assurance Process:**
1. Test playback on different headphone/speaker systems
2. Verify spatial effects are clearly perceptible
3. Check for technical issues or artifacts
4. Gather feedback from team members and external listeners

### Iteration and Refinement
**Collaborative Review Cycles:**
- Daily 15-minute team check-ins
- Mid-week detailed listening sessions
- End-of-week progress presentations to class
- Incorporation of feedback into revisions

### Advanced Techniques (Optional):
- Automation of spatial parameters over time
- Integration of field recordings or found sounds
- Experimental effects or processing techniques
- Interactive or adaptive elements

## Week 6: Documentation and Presentation

### Project Documentation
**Required Documentation:**
1. **Creative Brief** (1-2 pages)
   - Project concept and artistic goals
   - Target audience and intended impact
   - Key creative decisions and rationale

2. **Technical Report** (2-3 pages)
   - Tools and software used
   - Spatial audio techniques implemented
   - Challenges encountered and solutions
   - Quality assurance and testing process

3. **AI Collaboration Log** (1-2 pages)
   - Detailed record of AI tool usage
   - Examples of AI-generated content vs. human modifications
   - Reflection on AI as creative collaborator
   - Ethical considerations and attribution

4. **Team Collaboration Reflection** (1 page per member)
   - Individual contributions and role fulfillment
   - Collaborative challenges and successes
   - Learning outcomes and skills developed
   - Future applications of experience

### Final Presentation
**Presentation Requirements (15-20 minutes):**
1. **Performance** (5-7 minutes)
   - Playback of final composition through spatial audio system
   - Brief introduction to listening experience
   - Optimal listening conditions (headphones recommended)

2. **Process Overview** (5-7 minutes)
   - Key creative decisions and evolution of concept
   - Demonstration of spatial techniques used
   - Highlights of AI collaboration process
   - Team collaboration highlights

3. **Technical Deep Dive** (3-5 minutes)
   - Explanation of spatial audio implementation
   - Demonstration of before/after spatial processing
   - Discussion of technical challenges and solutions

4. **Q&A and Feedback** (2-3 minutes)
   - Audience questions and discussion
   - Peer feedback and suggestions
   - Reflection on presentation experience

## Assessment Criteria

### Musical Quality (25%)
**Excellent:** Sophisticated composition with clear structure, engaging musical content, and effective use of AI as creative collaborator  
**Proficient:** Good musical ideas with solid development and appropriate AI integration  
**Developing:** Basic musical content with limited development or over-reliance on unmodified AI output  

### Spatial Audio Implementation (25%)
**Excellent:** Creative and technically proficient use of spatial techniques that enhance musical experience  
**Proficient:** Competent implementation of spatial effects with clear positioning and movement  
**Developing:** Basic spatial effects with limited creativity or technical issues  

### Collaboration and Process (25%)
**Excellent:** Exceptional teamwork with clear role fulfillment, effective communication, and mutual support  
**Proficient:** Good collaborative process with adequate role distribution and team coordination  
**Developing:** Basic collaboration with some communication issues or uneven participation  

### Documentation and Presentation (25%)
**Excellent:** Comprehensive, reflective documentation and engaging, well-organized presentation  
**Proficient:** Complete documentation with adequate reflection and clear presentation  
**Developing:** Basic documentation with limited reflection or unclear presentation  

## Extension Activities

**Advanced Challenges:**
- Create multiple versions for different spatial audio formats
- Develop interactive elements or user controls
- Integrate with visual elements or multimedia
- Explore cultural or historical spatial audio techniques

**Cross-Curricular Connections:**
- Physics: Study of sound waves and acoustics
- Psychology: Perception and spatial hearing
- Technology: Programming and software development
- Art: Visual representation of spatial concepts

**Community Engagement:**
- Present to local musicians or audio professionals
- Share with other schools or educational institutions
- Submit to student composition competitions
- Create educational resources for younger students
---
*Part of Spatial AI Platform Educational Resource Library*`;
};

const generateGenericContent = (resource) => {
  return `# ${resource.title}

## ${resource.description}

This is a sample ${resource.type.toUpperCase()} resource for spatial audio education.

### Contents:
- Introduction to ${resource.category}
- Practical exercises
- Assessment materials
- Further reading

### Duration: ${resource.duration} minutes
### Difficulty: ${resource.difficulty}

---
Generated by Spatial AI Platform
`;
};

const openResourceContent = (title, content) => {
  const htmlContent = content
    .replace(/\n/g, '<br>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<br><br>/g, '<br>');

  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    return;
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 900px; margin: 0 auto; padding: 2rem; line-height: 1.6;
            background: #fafafa; color: #333;
          }
          .container {
            background: white; padding: 3rem; border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2563eb; border-bottom: 3px solid #2563eb;
            padding-bottom: 1rem; margin-bottom: 2rem;
          }
          h2 { color: #1e40af; margin-top: 2rem; margin-bottom: 1rem; }
          h3 { color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem; }
          p { margin-bottom: 1rem; }
          ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
          li { margin-bottom: 0.5rem; }
          strong { color: #1f2937; }
          em { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          ${htmlContent}
        </div>
      </body>
    </html>
  `);
  newWindow.document.close();
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
};

const normalizeBadgeValue = (value) => String(value || '').toLowerCase();

const getDifficultyColor = (difficulty) => {
  const value = normalizeBadgeValue(difficulty);
  if (value.includes('beginner')) return 'bg-green-100 text-green-700';
  if (value.includes('intermediate')) return 'bg-yellow-100 text-yellow-700';
  if (value.includes('advanced')) return 'bg-red-100 text-red-700';
  if (value.includes('all')) return 'bg-slate-100 text-slate-700';
  return 'bg-gray-100 text-gray-700';
};

const getCategoryColor = (category) => {
  const value = normalizeBadgeValue(category);
  if (value.includes('choral')) return 'bg-purple-100 text-purple-700';
  if (value.includes('theory')) return 'bg-blue-100 text-blue-700';
  if (value.includes('spatial')) return 'bg-indigo-100 text-indigo-700';
  if (value.includes('ai')) return 'bg-amber-100 text-amber-700';
  if (value.includes('policy')) return 'bg-slate-100 text-slate-700';
  return 'bg-gray-100 text-gray-700';
};

const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();
  const authorName = resource.author?.name || resource.authorName;
  const authorUniversity = resource.author?.university || resource.university;

  // ...

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-500 relative">
        {resolveAssetUrl(resource.thumbnailUrl) ? (
          <img
            src={resolveAssetUrl(resource.thumbnailUrl)}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-6xl font-bold">
            {resource.title.charAt(0)}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(resource.difficulty)}`}>
            {resource.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(resource.category)}`}>
            {resource.category}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {resource.type}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {resource.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {resource.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {resource.duration}m
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {resource.views || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{resource.rating?.average?.toFixed(1) || '0.0'}</span>
          </div>
        </div>

        {/* Author */}
        {(authorName || authorUniversity) && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {authorName || 'Unknown'}
              {authorUniversity ? ` • ${authorUniversity}` : ''}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={() => {
            if (resource.id) {
              navigate(`/resources/${resource.id}`);
              return;
            }
            const specificResources = {
              'Introduction to AI Music Tools': '/resources/introduction-to-ai-music-tools.md',
              'Spatial Audio Listening Exercise': '/resources/spatial-audio-listening-exercise.md',
              'Collaborative Composition Project': '/resources/collaborative-composition-project.md'
            };

            if (resource.content) {
              openResourceContent(resource.title, resource.content);
              return;
            }

            if (specificResources[resource.title]) {
              // Generate content directly for specific resources
              let content = '';
              
              if (resource.title === 'Introduction to AI Music Tools') {
                content = `# Introduction to AI Music Tools

## Overview
This comprehensive guide introduces educators to the revolutionary world of AI-powered music education tools, focusing on spatial audio and intelligent composition systems.

## Learning Objectives
By the end of this resource, you will:
- Understand the fundamentals of AI in music education
- Identify key AI tools and their applications
- Implement AI tools in your curriculum
- Evaluate AI-generated content critically
- Design AI-enhanced learning experiences

## 1. Understanding AI in Music Education

### What is AI Music Technology?
Artificial Intelligence in music refers to systems that can:
- Generate melodies, harmonies, and rhythms
- Analyze and classify musical patterns
- Provide intelligent feedback on compositions
- Create adaptive learning experiences
- Process and manipulate audio in real-time

### Benefits for Educators
- **Personalized Learning**: AI adapts to individual student needs
- **Creative Inspiration**: Generates ideas to overcome creative blocks
- **Technical Analysis**: Provides detailed feedback on musical elements
- **Accessibility**: Makes complex music theory more approachable
- **Engagement**: Interactive tools keep students motivated

## 2. Core AI Music Tools

### Composition Assistants
- **Melody Generators**: Create original melodies in various styles
- **Harmony Suggesters**: Recommend chord progressions
- **Rhythm Makers**: Generate drum patterns and rhythmic ideas
- **Style Transfer**: Apply characteristics of different musical genres

### Analysis Tools
- **Pattern Recognition**: Identify musical structures and motifs
- **Performance Evaluation**: Assess timing, pitch accuracy, dynamics
- **Style Analysis**: Compare student work to established styles
- **Progress Tracking**: Monitor learning over time

### Production Tools
- **Auto-Mastering**: Professional-quality audio finishing
- **Intelligent Mixing**: Balance instruments automatically
- **Sound Design**: Generate unique timbres and effects
- **Spatial Audio**: Create immersive 3D soundscapes

## 3. Implementation Strategies

### Getting Started
1. **Start Small**: Begin with one tool for specific tasks
2. **Student Training**: Teach proper AI tool usage
3. **Clear Guidelines**: Establish when and how to use AI
4. **Regular Assessment**: Evaluate effectiveness regularly

### Best Practices
- Use AI as a collaborator, not a replacement
- Encourage critical evaluation of AI suggestions
- Maintain focus on human creativity and expression
- Document AI usage for transparency
- Balance efficiency with learning objectives

## 4. Pedagogical Integration

### Composition Lessons
- Use AI for initial idea generation
- Teach students to refine AI suggestions
- Compare human vs AI compositional choices
- Explore different AI-generated styles

### Music Theory
- Visualize complex theoretical concepts
- Generate examples in real-time
- Create personalized exercises
- Analyze student compositions automatically

### Performance Practice
- Generate accompaniments for solo practice
- Create backing tracks in various styles
- Provide real-time performance feedback
- Adapt difficulty to student level

## 5. Assessment and Evaluation

### Evaluating AI-Assisted Work
- Focus on creative decisions, not just output
- Assess understanding of AI tool capabilities
- Evaluate critical thinking about AI suggestions
- Consider the learning process, not just results

### Student Self-Assessment
- Reflection on AI tool usage
- Identification of personal creative contributions
- Analysis of learning gains from AI interaction
- Goal setting for future AI collaboration

## 6. Ethical Considerations

### Academic Integrity
- Clear attribution of AI assistance
- Transparent documentation of AI usage
- Emphasis on personal creative contribution
- Understanding of AI limitations and biases

### Creative Authenticity
- Maintaining individual artistic voice
- Using AI to enhance, not replace, creativity
- Understanding the difference between inspiration and imitation
- Developing critical evaluation skills

## 7. Future Directions

### Emerging Technologies
- Real-time collaborative AI systems
- Advanced natural language music interfaces
- Improved style transfer capabilities
- Enhanced spatial audio generation

### Educational Evolution
- AI-powered adaptive curricula
- Personalized learning pathways
- Advanced performance analytics
- Global collaborative music platforms

## Resources for Further Learning
- AI music research papers and journals
- Online courses in music technology
- Professional development workshops
- Community forums and discussion groups

---
*Generated by Spatial AI Platform - Educational Resource Library*`;
              } else if (resource.title === 'Spatial Audio Listening Exercise') {
                content = generateSpatialExerciseContent();
              } else if (resource.title === 'Collaborative Composition Project') {
                content = generateCollaborativeProjectContent();
              }
              
              openResourceContent(resource.title, content);
              return;
            }

            // Handle by resource type
            if (resource.type === 'video') {
              alert(`🎥 Opening video: "${resource.title}"\n\nAdd a hosted video or curated write-up to keep this content in-app.`);
            } else if (resource.type === 'pdf' || resource.type === 'document') {

              // Generate specific content based on title
              let content = '';
              
              if (resource.title.includes('Rubric')) {
                content = generateRubricContent(resource.title);
              } else if (resource.title.includes('Checklist')) {
                content = generateChecklistContent(resource.title);
              } else if (resource.title.includes('Guidelines')) {
                content = generateGuidelinesContent(resource.title);
              } else {
                content = generateGenericContent(resource);
              }
              
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${resource.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
              link.click();
              URL.revokeObjectURL(url);
              
              alert(`✅ Downloaded: "${resource.title}"\n\nCheck your downloads folder for the file!`);
            } else if (resource.type === 'interactive') {
              window.location.href = '/practice';
            } else {
              alert(`📚 Accessing: "${resource.title}"\n\nResource Type: ${resource.type}\nCategory: ${resource.category}\nDescription: ${resource.description}`);
            }
          }}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {resource.id ? '👁️ View Resource' :
            resource.type === 'pdf' || resource.type === 'document' ? '📄 Download' :
            resource.type === 'video' ? '🎥 Watch' :
            resource.type === 'interactive' ? '🎮 Try Interactive' :
            '👁️ View Resource'}
        </button>

      </div>
    </div>
  );
};

export default ResourceCard;