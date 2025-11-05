import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import { UserAssessmentProgress } from '../types/course';

interface AssessmentWithCourse extends UserAssessmentProgress {
  course?: {
    _id: string;
    title: string;
  };
  weekNumber?: number;
  dayNumber?: number;
}

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const res = await api.get<AssessmentWithCourse[]>('/api/assessments/user');
        setAssessments(Array.isArray(res) ? res : []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
        setError('Failed to load assessments.');
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><FileText className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'waiting for review':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><AlertCircle className="w-3 h-3 mr-1" />Review Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingAssessments = assessments.filter(a => a.status === 'pending');
  const submittedAssessments = assessments.filter(a => a.status === 'submitted');
  const reviewPendingAssessments = assessments.filter(a => a.status === 'waiting for review');
  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const failedAssessments = assessments.filter(a => a.status === 'failed');

  const renderAssessmentCard = (assessment: AssessmentWithCourse) => {
    const courseTitle = assessment.course?.title || 'Unknown Course';
    const weekDay = assessment.weekNumber && assessment.dayNumber 
      ? `Week ${assessment.weekNumber}, Day ${assessment.dayNumber}` 
      : '';

    return (
      <Card key={assessment._id || `${assessment.course?._id || assessment.courseId}-${assessment.dayId}`} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{assessment.assessmentTitle}</CardTitle>
              <CardDescription className="mt-2">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{courseTitle}</div>
                  {weekDay && <div className="text-sm">{weekDay}</div>}
                </div>
              </CardDescription>
            </div>
            {getStatusBadge(assessment.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessment.assessmentLink && (
              <div className="flex items-center">
                <a
                  href={assessment.assessmentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Assessment
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}
            
            {assessment.submittedLink && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Your Submission:</span>
                <a
                  href={assessment.submittedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  View Submission
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            {assessment.feedback && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Feedback:</div>
                <div className="text-sm text-muted-foreground">{assessment.feedback}</div>
              </div>
            )}

            {assessment.submissionDate && (
              <div className="text-xs text-muted-foreground">
                Submitted: {new Date(assessment.submissionDate).toLocaleDateString()}
              </div>
            )}

            {assessment.reviewDate && (
              <div className="text-xs text-muted-foreground">
                Reviewed: {new Date(assessment.reviewDate).toLocaleDateString()}
              </div>
            )}

            {assessment.status === 'pending' && (assessment.course?._id || assessment.courseId) && (
              <Link to={`/course/${assessment.course?._id || assessment.courseId}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  Go to Course
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div>Loading assessments...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen text-red-500">
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold mb-6 text-foreground">My Assessments</h1>
        <p className="text-muted-foreground mb-8">
          View and manage all your assessments from enrolled courses
        </p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAssessments.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedAssessments.length})</TabsTrigger>
            <TabsTrigger value="review">Review Pending ({reviewPendingAssessments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedAssessments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {assessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No assessments found.</p>
                <p className="text-sm mt-2">Start a course to see assessments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map(assessment => renderAssessmentCard(assessment))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No pending assessments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssessments.map(assessment => renderAssessmentCard(assessment))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="mt-6">
            {submittedAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No submitted assessments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedAssessments.map(assessment => renderAssessmentCard(assessment))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            {reviewPendingAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No assessments pending review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewPendingAssessments.map(assessment => renderAssessmentCard(assessment))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No completed assessments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedAssessments.map(assessment => renderAssessmentCard(assessment))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Assessments;

