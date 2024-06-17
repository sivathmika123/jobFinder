const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer')
const upload = multer({dest:'uploads/'})



const port = 9990;
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/profile")
app.use(express.static(path.join(__dirname, 'public')));


app.use(flash())
app.use(express.json())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use(session({
    secret:'my secret key',
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}
}))

const UserCompanySchema=new mongoose.Schema({
    companyname:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    cpassword:{type:String,required:true}
    
    
})
const Company=mongoose.model('companys',UserCompanySchema);



const profileSchema = new mongoose.Schema({
    CompanyName:{type:String, required:true},
    job_title:{type:String, required:true},
    experience:{type:String, require:true},
    salary:{type:Number, required:true},
    location:{type:String, required:true},
    jobDescription:{type:String, required:true},
    requirements:{type:String, required:true},
    skills:{type:[String],required:true},
    duration:{type:String, required:true},
    start_date:{type:Date, required:true},
    application_deadline:{type:Date, required:true},
    applications:[{type:mongoose.Schema.Types.ObjectId, ref:'applications'}]

})

const jobs = mongoose.model('lists',profileSchema);

const UserCandidateSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cpassword: { type: String, required: true },
    
    jobApplications: [{
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'lists' },
        status: { type: String, enum: ['applied', 'in-review', 'accepted', 'rejected'], default: 'applied' },
        appliedAt: { type: Date, default: Date.now }
    }]
});


const Candidates = mongoose.model('candidates', UserCandidateSchema);
//application tracker

const ApplicationSchema = new mongoose.Schema({

    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'candidates' , required:true},
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'lists' },
    status: { type: String, enum: ['applied', 'in-review', 'accepted', 'rejected'], default: 'applied' },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ApplicationSchema.index({candidateId:1, jobId:1},{unique:true});
const Application = mongoose.model('applications', ApplicationSchema);




app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async(req, res)=>{
    res.render('index');
})

app.get('/home', async (req, res) => {
    try {
        const items = await jobs.find();
        const user = req.session.user;
        let userSpecificJobs = [];

        if (user) {
            if (user.type === 'Company') {

                const company = await Company.findById(user.id);
                userSpecificJobs = await jobs.find({ CompanyName: company.companyname });

            } 
            else if (user.type === 'Candidates') {
               
                const candidate = await Candidates.findById(user.id).populate({
                   
                    path:'jobApplications',
                    populate:{path:'jobId', model:'lists'}
            });

                userSpecificJobs = candidate.jobApplications.map(application => application.jobId);
            }
        }

        res.render('home', { items, user, userSpecificJobs });
    }
     catch (error) {

        console.error('Error fetching jobs:', error);
        res.status(500).send('Error fetching jobs');
    }
});



app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/candidate', (req, res) => {
    res.render('candidate');
});

app.get("/company", (req, res) => {
    res.render('company');
});


app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/prop", (req, res) => {
    res.render('prop',{user:req.session.user, job: null});
});


app.get("/about", (req, res)=>{
    res.render('about');
})
app.get("/findajob",(req,res)=>{
    res.render('findajob');
})
app.get("/contact",(req,res)=>{
    res.render('contact');
})
app.get("/home",(req,res)=>{
    res.render('home');
})




app.get("/job/:id", async(req, res)=>{
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid job ID');
    }

    try{

        const job = await jobs.findById(req.params.id);
        const user = req.session.user;
        
        if(job){
            res.render('job-details',{job, user})
        }
        else{
            res.status(404).send('job not found');
        }
    }
    catch(err){
        res.status(500).send('Error fetching job details. Please try again later.');
    }
})
app.get("/jobs", async (req, res) => {
    try {
        const jobListings = await jobs.find({});
        res.redirect('/home');
    } catch (error) {
        console.error("Error fetching job listings:", error);
        res.status(500).send('Error fetching job listings. Please try again later.');
    }
});
app.get('/apply', async (req, res) => {
    if (!req.session.user || req.session.user.type !== 'Candidates') {
        return res.redirect('/login');
    }

    try {
        const candidate = await Candidates.findById(req.session.user.id).populate('jobApplications.jobId');
        res.render('apply', { applications: candidate.jobApplications });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching applications.');
    }
});




app.post("/job",async(req, res) =>{
    if(!req.session.user || req.session.user.type !== 'Company'){
        return res.redirect('/login')
    }
try{

    const newjob = new jobs({

        CompanyName:req.body.CompanyName,
        job_title:req.body.job_title,
        experience:req.body.experience,
        salary:req.body.salary,
        location:req.body.location,
        jobDescription:req.body.jobDescription,
        requirements:req.body.requirements,
        skills:req.body.skills,
        duration:req.body.duration,
        start_date:req.body.start_date,
        application_deadline:req.body.application_deadline

        });
        await newjob.save();
        req.flash('success','Job saved successfully.'); 
        res.redirect('/dashboard')
    }
    catch(err){
        res.send('Error saving job Details to the database.'+err);
    }

})

app.post("/logins",async (req, res)=>{
    
    const { email, password } = req.body;

    try {
       
        const user = await Candidates.findOne({ email, password });
        const user1 = await Company.findOne({email, password});

        

        if (user) {
            req.session.user = {id:user._id, type:'Candidates'};
            res.redirect('/home')
        }
        else if(user1){
            req.session.user = {id:user1._id, type:'Company'}
            res.redirect('/home')
        }
         else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.send('Error occurred during login');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        let jobPosts = [];
        let userType;
        let user;

        if (req.session.user.type === 'Company') {

            user = await Company.findById(req.session.user.id);
            jobPosts = await jobs.find({ CompanyName: user.companyname }).populate({
               
                path:'applications',
                populate:{path:'candidateId', model:'candidates'}
            });

            userType = 'Company';

        } 
        else if (req.session.user.type === 'Candidates') {
            user = await Candidates.findById(req.session.user.id).populate({
                path:'jobApplications.jobId',
                model:'lists'
        });
            jobPosts = user.jobApplications;
            userType = 'Candidates';
        }

        const successMessage = req.flash('success'); // Get success message if any

        res.render('dashboard', { user, jobPosts, userType, successMessage });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user details');
    }
});


app.get("/profile", async(req, res)=>{
    if(!req.session.user){
        res.redirect("/login")
    }
    else{
        const user =req.session.user.type ==='Candidate'?
         await Company.findById(req.session.user.id):
         await Candidates.findById(req.session.user.id);

        res.render("profile", {user});
    }

})

app.post("/profile", async(req, res)=>{
    if(!req.session.user){
        return res.redirect("/login")
    }
    else{
        const {firstname, email} = req.body;
        const update = {firstname, email};

        if(req.session.user.type === 'Company'){
             await Company.findByIdAndUpdate(req.session.user.id, update);
        }
        else{
            await Candidates.findByIdAndUpdate(req.session.user.id, update);
        }

        req.flash('success', 'Profile got updated');
        res.redirect("/profile");
    }

})

app.get('/apply/:jobId', async (req, res) => {
    try {
        const job = await jobs.findById(req.params.jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }
        res.render('apply', { job });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading job application form');
    }
});

app.post('/apply/:jobId', upload.single('resume'), async(req, res)=>{
    if(!req.session.user || req.session.user.type !== 'Candidates'){
        return res.redirect('/login')
    }
    try {
        const {jobId} = req.params;
        const candidateId = req.session.user.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).send('Invalid job ID');
        }

        const job = await jobs.findById(jobId);

        if (!job) {
            return res.status(404).send('Job not found');
        }

        if (new Date() > job.application_deadline) {
            
            req.flash('failed', 'The application deadline has passed');
            res.redirect('/dashboard');
        }

        // Check if the candidate has already applied for this job
        const existingApplication = await Application.findOne({ candidateId, jobId });
        

        if (existingApplication) {
            
            req.flash('failed', 'You have already applied for this job');
            res.redirect('/dashboard');
            
        }

         // Create new application
        const newApplication = new Application({
            candidateId,
            jobId,
            status: 'applied',
            appliedAt: new Date(),
            updatedAt: new Date()
        });

        await newApplication.save();



        const candidate = await Candidates.findById(candidateId);
      
        candidate.jobApplications.push({jobId, status:'applied'});
        await candidate.save();

        job.applications.push(newApplication._id)
        await job.save();


        req.flash('success', 'Application submitted successfully.');
        res.redirect('/dashboard');
    } 
    catch (error) {

       
        console.error(error);
        res.status(500).send('Error submitting application');
    }
});



app.get('/edit/:jobId', async (req, res) => {
    try {
        const job = await jobs.findById(req.params.jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }
        
        res.render('prop', {user:req.session.user, job });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading edit form');
    }
});

app.post('/edit/:jobId', async (req, res) => {
    try {
        const { CompanyName, job_title, experience, salary, location, jobDescription, requirements, skills, duration, start_date, application_deadline } = req.body;
        const job = await jobs.findByIdAndUpdate(req.params.jobId, {
            CompanyName,
            job_title,
            experience,
            salary,
            location,
            jobDescription,
            requirements,
            skills,
            duration,
            start_date,
            application_deadline
        }, { new: true });

        if (!job) {
            return res.status(404).send('Job not found');
        }

        req.flash('success', 'Job updated successfully.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating job');
    }
});

app.post('/update-status/:candidateId/:jobId', async (req, res) => {
    const { status } = req.body;
    const { candidateId, jobId } = req.params;

    try {
        await Candidates.updateOne(
            { _id: candidateId, "jobApplications.jobId": jobId },
            { $set: { "jobApplications.$.status": status } }
        );
        req.flash('success', 'Application status updated successfully.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating application status.');
    }
});






app.post('/delete/:jobId', async (req, res) => {
    try {
        const job = await jobs.findByIdAndDelete(req.params.jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        req.flash('success', 'Job deleted successfully.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting job');
    }
});



app.post('/candidates', async (req, res) => {
    if (!req.body || !req.body.password || !req.body.cpassword) {
        res.flash('error',"Invalid request");
        return res.redirect('/signup')
    }

    if (req.body.password !== req.body.cpassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/signup');
    }

    try {
        const newUser = new Candidates({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            cpassword: req.body.cpassword
        });

        await newUser.save();
        // res.send('User saved to the database!');
        req.flash('success', 'New Candidate added successfully.');
        req.session.user = { id: newUser._id, type: 'Candidates' };
        res.redirect('/dashboard');
    } catch{
        req.flash('error', 'Error saving candidate to the database.');
        res.redirect('/signup');
    }
});
app.post('/companys',async (req,res) =>{
    if(!req.body||!req.body.password||!req.body.cpassword){
        res.flash('error',"Invalid request");
        return res.redirect('/signup')
    }
    if(req.body.password!=req.body.cpassword){
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/signup');
    }
    try{
        const newUser=new Company({
            companyname:req.body.companyname,
            email:req.body.email,
            password:req.body.password,
            cpassword:req.body.cpassword
        });
        await newUser.save();

        req.flash('success', 'New Company added successfully.');
        req.session.user = { id: newUser._id, type: 'Company' };
        res.redirect('/dashboard');

    }
    catch (err) {
        req.flash('error', 'Error saving company to the database.');
        res.redirect('/signup');
    }
})







app.get("/logout",(req, res)=>{
    req.session.destroy(err=>{
        if(err){
            return res.redirect('/dashboard')
        }
        res.redirect('/login')
    })
})

app.post('/cancel-application/:jobId', async (req, res) => {
    try {
        const job = await jobs.findByIdAndDelete(req.params.jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        req.flash('success', 'Job deleted successfully.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting job');
    }
});








app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});


