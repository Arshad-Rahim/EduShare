"use client";

import React, { useCallback, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(-1); // Go back to the previous page
  }, [navigate]);

  const notFoundUI = useMemo(
    () => (
      <div
        className={cn(
          "flex justify-center items-center min-h-screen p-4 bg-background"
        )}
      >
        <Card className="w-full max-w-md border-t-4 border-black-500 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-extrabold text-red-500">
              404
            </CardTitle>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-lg">
              Sorry, we couldn’t find the page you’re looking for. It might have
              been moved or doesn’t exist.
            </p>
            <Button
              onClick={handleGoBack}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    ),
    [handleGoBack] 
  );

  return notFoundUI;
};


export default memo(NotFound);
