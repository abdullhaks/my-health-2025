import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeft, Download, Pill, Calendar, User, FileText } from "lucide-react";
import moment from "moment";
import { jsPDF } from "jspdf";
import { getPrescription } from "../../api/user/userApi";
import appLogoblue from "../../assets/applogoblue.png";

interface Prescription {
  _id: string;
  appointmentId: string;
  userId: string;
  doctorId: string;
  medicalCondition: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    notes: string;
  }[];
  createdAt: string;
  user: {
    fullName: string;
    dob: Date;
  };
  doctor: {
    fullName: string;
    graduation: string;
    category: string;
    registerNo: string;
  };
  notes?: string;
}

const UserPrescriptionDetails = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      if (!appointmentId) return;

      const response = await getPrescription(appointmentId);
      if (response) {
        console.log("prescription response is:", response);
        setPrescription({
          ...response.prescription,
          user: response.user,
          doctor: response.doctor,
        });
      } else {
        setErrorMessage("Failed to load prescription details.");
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setErrorMessage("Failed to load prescription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) fetchPrescription();
  }, [appointmentId]);

  const calculateAge = (dob: Date) => {
    return moment().diff(moment(dob), "years");
  };

  const downloadPDF = () => {
    if (!prescription) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Header border
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(margin, 15, pageWidth - margin, 15);

    // Add logo and clinic header
    try {
      doc.addImage(appLogoblue, "PNG", margin, y, 35, 18);
    } catch (e) {
      console.log("Logo not loaded");
    }

    // Clinic name and details
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("MyHealth App", pageWidth - margin, y + 5, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Digital Healthcare Solutions", pageWidth - margin, y + 12, { align: "right" });
    doc.text("Registration: MH-2025-DIGITAL", pageWidth - margin, y + 18, { align: "right" });

    y += 35;

    // Prescription header
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPTION", margin + 15, y);

    // Date and Prescription ID
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${moment(prescription.createdAt).format("DD/MM/YYYY")}`, pageWidth - margin, y - 8, { align: "right" });
    doc.text(`Rx No: ${prescription._id.slice(-8).toUpperCase()}`, pageWidth - margin, y + 2, { align: "right" });

    y += 25;

    // Patient Information Box
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PATIENT INFORMATION", margin + 5, y + 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.user.fullName}`, margin + 5, y + 15);
    doc.text(`Age: ${calculateAge(prescription.user.dob)} years`, margin + 5, y + 23);
    doc.text(`Patient ID: ${prescription.userId.slice(-8).toUpperCase()}`, pageWidth/2 + 10, y + 15);
    doc.text(`Date of Birth: ${moment(prescription.user.dob).format("DD/MM/YYYY")}`, pageWidth/2 + 10, y + 23);

    y += 45;

    // Doctor Information Box
    doc.setFillColor(235, 247, 255);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35, 'F');
    doc.setDrawColor(41, 128, 185);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 35);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PRESCRIBING PHYSICIAN", margin + 5, y + 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dr. ${prescription.doctor.fullName}`, margin + 5, y + 15);
    doc.text(`${prescription.doctor.graduation}`, margin + 5, y + 23);
    doc.text(`Specialty: ${prescription.doctor.category}`, pageWidth/2 + 10, y + 15);
    doc.text(`Reg. No: ${prescription.doctor.registerNo}`, pageWidth/2 + 10, y + 23);

    y += 45;

    // Diagnosis
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNOSIS:", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const diagnosisLines = doc.splitTextToSize(prescription.medicalCondition, pageWidth - 2 * margin);
    doc.text(diagnosisLines, margin, y);
    y += diagnosisLines.length * 5 + 10;

    // General Notes
    if (prescription.notes) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("GENERAL NOTES:", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(prescription.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, y);
      y += notesLines.length * 5 + 10;
    }

    // Medications Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICATIONS PRESCRIBED:", margin, y);
    y += 12;

    // Medications Table Header
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("S.No", margin + 3, y + 2);
    doc.text("MEDICATION", margin + 20, y + 2);
    doc.text("DOSAGE", margin + 80, y + 2);
    doc.text("FREQUENCY", margin + 115, y + 2);
    doc.text("DURATION", margin + 155, y + 2);
    y += 12;

    // Medications List
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    prescription.medications.forEach((med, index) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, 25, 'F');
      }

      doc.setFontSize(9);
      doc.text(`${index + 1}.`, margin + 3, y + 5);

      // Medication name (bold)
      doc.setFont("helvetica", "bold");
      const medNameLines = doc.splitTextToSize(med.name, 55);
      doc.text(medNameLines, margin + 20, y + 5);

      doc.setFont("helvetica", "normal");
      doc.text(med.dosage, margin + 80, y + 5);
      doc.text(med.frequency, margin + 115, y + 5);
      doc.text(med.duration, margin + 155, y + 5);

      // Instructions
      if (med.instructions) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const instrLines = doc.splitTextToSize(`Instructions: ${med.instructions}`, pageWidth - 2 * margin - 20);
        doc.text(instrLines, margin + 20, y + 12);
      }

      // Notes
      if (med.notes) {
        doc.setFontSize(8);
        doc.setTextColor(200, 100, 100);
        const notesLines = doc.splitTextToSize(`Notes: ${med.notes}`, pageWidth - 2 * margin - 20);
        doc.text(notesLines, margin + 20, y + 18);
      }

      y += 30;
      doc.setTextColor(0, 0, 0);
    });

    // Footer
    y = pageHeight - 40;
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a digitally generated prescription. Please consult your physician before making any changes.", margin, y + 8);
    doc.text(`Generated on: ${moment().format("DD/MM/YYYY HH:mm")}`, margin, y + 15);

    // Doctor signature placeholder
    doc.setFont("helvetica", "italic");
    doc.text("Dr. " + prescription.doctor.fullName, pageWidth - margin, y + 8, { align: "right" });
    doc.setFontSize(7);
    doc.text("Digital Signature", pageWidth - margin, y + 15, { align: "right" });

    // Save PDF
    doc.save(`Prescription_${prescription.user.fullName.replace(/\s+/g, '_')}_${moment().format("DDMMYYYY")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 p-2 sm:p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <ArrowLeft size={20} />
              <span className="text-sm sm:text-base font-medium hidden sm:inline">Back</span>
            </button>
            <Button
              type="primary"
              icon={<Download size={18} />}
              onClick={downloadPDF}
              disabled={!prescription}
              className="flex items-center gap-2 h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700 border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Download Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3 text-sm sm:text-base">
            <FileText className="text-red-500" size={20} />
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading prescription...</p>
          </div>
        ) : !prescription ? (
          <div className="text-center py-12 sm:py-16">
            <FileText className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-gray-500 text-base sm:text-lg">No prescription found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Medical Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={appLogoblue}
                    alt="MyHealth App"
                    className="h-12 sm:h-14 lg:h-16 object-contain bg-white p-2 rounded-lg shadow-md"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">MyHealth App</h1>
                    <p className="text-blue-100 text-sm sm:text-base">Digital Healthcare Solutions</p>
                    <p className="text-blue-200 text-xs sm:text-sm">Registration: MH-2025-DIGITAL</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">℞</div>
                  <p className="text-blue-100 text-sm sm:text-base">Prescription</p>
                  <p className="text-blue-200 text-xs sm:text-sm">Rx No: {prescription._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Date and Basic Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18}  />
                  <span className="font-medium text-sm sm:text-base">Date:</span>
                  <span className="text-sm sm:text-base">{moment(prescription.createdAt).format("MMMM DD, YYYY")}</span>
                </div>
                <div className="text-gray-500 text-xs sm:text-sm">
                  Generated at {moment(prescription.createdAt).format("HH:mm")}
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-blue-600" size={20} />
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-900">Patient Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{prescription.user.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Age</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{calculateAge(prescription.user.dob)} years</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{moment(prescription.user.dob).format("MMMM DD, YYYY")}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Patient ID</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base font-mono">{prescription.userId.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 text-white p-2 rounded-full">
                    <User size={18}  />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-900">Prescribing Physician</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Doctor Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Dr. {prescription.doctor.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Qualification</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{prescription.doctor.graduation}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Specialty</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{prescription.doctor.category}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Registration Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base font-mono">{prescription.doctor.registerNo}</p>
                  </div>
                </div>
              </div>

              {/* Medical Condition/Diagnosis */}
              <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-amber-600" size={20} />
                  <h3 className="text-lg sm:text-xl font-semibold text-amber-900">Diagnosis</h3>
                </div>
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed bg-white p-3 sm:p-4 rounded-lg border border-amber-100">
                  {prescription.medicalCondition}
                </p>
              </div>

              {/* General Notes */}
              {prescription.notes && (
                <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="text-red-600" size={20}  />
                    <h3 className="text-lg sm:text-xl font-semibold text-red-900">General Notes</h3>
                  </div>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed bg-white p-3 sm:p-4 rounded-lg border border-red-100">
                    {prescription.notes}
                  </p>
                </div>
              )}

              {/* Medications */}
              <div className="bg-purple-50 rounded-xl p-4 sm:p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <Pill className="text-purple-600" size={20}  />
                  <h3 className="text-lg sm:text-xl font-semibold text-purple-900">Medications Prescribed</h3>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                      <div className="bg-purple-600 text-white px-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h4 className="font-semibold text-base sm:text-lg truncate">{index + 1}. {med.name}</h4>
                          <span className="bg-purple-500 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">{med.dosage}</span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Frequency</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{med.frequency}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 mt-3">Duration</p>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{med.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Instructions</p>
                          <p className="text-gray-800 text-sm sm:text-base bg-gray-50 p-2 sm:p-3 rounded leading-relaxed">{med.instructions}</p>
                          {med.notes && (
                            <>
                              <p className="text-xs sm:text-sm text-gray-600 mb-1 mt-3">Additional Notes</p>
                              <p className="text-red-700 text-sm sm:text-base bg-red-50 p-2 sm:p-3 rounded leading-relaxed border border-red-200">{med.notes}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6 text-center text-gray-500">
                <p className="text-xs sm:text-sm mb-2">This is a digitally generated prescription. Please consult your physician before making any changes.</p>
                <p className="text-xs sm:text-sm">Generated on {moment().format("MMMM DD, YYYY [at] HH:mm")}</p>
                <div className="mt-4 text-right">
                  <p className="text-gray-700 text-sm sm:text-base font-medium">Dr. {prescription.doctor.fullName}</p>
                  <p className="text-xs text-gray-500 italic">Digital Signature</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPrescriptionDetails;