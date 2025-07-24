import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TaskMatrix</h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h2>
          <p className="text-gray-600">Last updated: January 17, 2025</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using TaskMatrix, you accept and agree to be bound by the terms and 
              provisions of this agreement. If you do not agree to abide by the above, please do not 
              use this service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h3>
            <p className="text-gray-600 leading-relaxed">
              Permission is granted to temporarily download one copy of TaskMatrix per device for 
              personal, non-commercial transitory viewing only. This is the grant of a license, not 
              a transfer of title, and under this license you may not:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for any commercial purpose or for any public display</li>
              <li>• Attempt to decompile or reverse engineer any software contained on TaskMatrix</li>
              <li>• Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Disclaimer</h3>
            <p className="text-gray-600 leading-relaxed">
              The materials on TaskMatrix are provided on an 'as is' basis. TaskMatrix makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or 
              other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Limitations</h3>
            <p className="text-gray-600 leading-relaxed">
              In no event shall TaskMatrix or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on TaskMatrix, even if TaskMatrix 
              or a TaskMatrix authorized representative has been notified orally or in writing of the 
              possibility of such damage.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy Policy</h3>
            <p className="text-gray-600 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the service, to understand our practices.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Information</h3>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at 
              support@taskmatrix.com.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary-600 hover:text-primary-500 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
