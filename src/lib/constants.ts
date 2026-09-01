/** Registration fee in kobo (₦5,000) */
export const REGISTRATION_FEE = 500000;

/** Monthly membership fee in kobo (₦1,000) */
export const MONTHLY_FEE = 100000;

/** Format kobo value to Naira string */
export function formatKobo(kobo: number): string {
 const naira = kobo / 100;
 return `₦${naira.toLocaleString('en-NG')}`;
}

/** Student levels at UNN */
export const LEVELS = ['100', '200', '300', '400', '500', 'PG'] as const;
export type Level = (typeof LEVELS)[number];

/** All 15 UNN faculties and their departments */
export const FACULTIES_AND_DEPARTMENTS: Record<string, string[]> = {
 'Faculty of Agriculture': [
 'Agricultural Economics',
 'Agricultural Extension',
 'Animal Science',
 'Crop Science',
 'Food Science & Technology',
 'Home Science, Nutrition & Dietetics',
 'Soil Science',
 ],
 'Faculty of Arts': [
 'Archaeology & Tourism',
 'English & Literary Studies',
 'Fine & Applied Arts',
 'Foreign Languages',
 'History & International Studies',
 'Linguistics & Nigerian Languages',
 'Mass Communication',
 'Music',
 'Performing Arts',
 ],
 'Faculty of Biological Sciences': [
 'Biochemistry',
 'Microbiology',
 'Plant Science & Biotechnology',
 'Zoology & Environmental Biology',
 ],
 'Faculty of Business Administration': [
 'Accountancy',
 'Banking & Finance',
 'Business Administration',
 'Management',
 'Marketing',
 ],
 'Faculty of Education': [
 'Adult Education',
 'Arts Education',
 'Computer Education',
 'Education Foundation',
 'Health & Physical Education',
 'Library & Information Science',
 'Science Education',
 'Social Science Education',
 'Vocational Teacher Education',
 ],
 'Faculty of Engineering': [
 'Agricultural & Bioresources Engineering',
 'Civil Engineering',
 'Electrical Engineering',
 'Electronic Engineering',
 'Materials & Metallurgical Engineering',
 'Mechanical Engineering',
 ],
 'Faculty of Environmental Studies': [
 'Architecture',
 'Estate Management',
 'Surveying & Geodesy',
 'Urban & Regional Planning',
 ],
 'Faculty of Health Science & Technology': [
 'Medical Laboratory Science',
 'Medical Rehabilitation',
 'Nursing Sciences',
 ],
 'Faculty of Law': [
 'International Law & Jurisprudence',
 'Property Law',
 'Public & Private Law',
 ],
 'Faculty of Pharmaceutical Sciences': [
 'Clinical Pharmacy',
 'Pharmaceutical & Medicinal Chemistry',
 'Pharmaceutical Technology',
 'Pharmaceutics',
 'Pharmacognosy & Environmental Medicines',
 'Pharmacology & Toxicology',
 ],
 'Faculty of Physical Sciences': [
 'Computer Science',
 'Geology',
 'Mathematics',
 'Physics & Astronomy',
 'Pure & Industrial Chemistry',
 'Statistics',
 ],
 'Faculty of Social Sciences': [
 'Economics',
 'Geography',
 'Philosophy',
 'Psychology',
 'Public Administration',
 'Religious & Cultural Studies',
 'Social Work',
 'Sociology & Anthropology',
 ],
 'Faculty of Dentistry': [
 'Child Dental Health',
 'Oral Maxillofacial Surgery',
 'Preventive Dentistry',
 'Restorative Dentistry',
 ],
 'Faculty of Veterinary Medicine': ['Veterinary Medicine'],
 'College of Medicine': [
 'Anaesthesia',
 'Anatomy',
 'Chemical Pathology',
 'Community Medicine',
 'Dermatology',
 'Haematology & Immunology',
 'Medical Biochemistry',
 'Medicine',
 'Obstetrics & Gynaecology',
 'Ophthalmology',
 'Paediatrics',
 'Pathology',
 'Pharmacology & Therapeutics',
 'Physiology',
 'Psychiatry',
 'Radiology',
 'Surgery',
 ],
};

/** Racket order statuses */
export const RACKET_STATUSES = [
 'pending',
 'confirmed',
 'ordered',
 'shipped',
 'delivered',
 'cancelled',
] as const;
export type RacketStatus = (typeof RACKET_STATUSES)[number];

export const RACKET_STATUS_LABELS: Record<RacketStatus, string> = {
 pending: 'Pending',
 confirmed: 'Confirmed',
 ordered: 'Ordered',
 shipped: 'Shipped',
 delivered: 'Delivered',
 cancelled: 'Cancelled',
};

/** Payment types */
export const PAYMENT_TYPES = ['registration', 'monthly', 'racket'] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

/** Payment statuses */
export const PAYMENT_STATUSES = [
 'pending',
 'success',
 'failed',
 'refunded',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
