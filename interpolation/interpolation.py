import os
import numpy as np


class InterpolationModule:

    def __init__(input_label):
        self.training_folder = os.path.join(os.path.abspath(__file__), '..', 'data', 'gifs')
        self.training_animation_label = input_label

    def compute_interpolation_vectors(start, finish, vectors):
        """
            Input:
                - start (numpy.ndarray): Vector array of size (`bottleneck_res`), where `bottleneck_res`
                    is the resolution of the autoencoder, representing the compressed bar chart
                - finish (numpy.ndarray): Vector array of size (`bottleneck_res`), where `bottleneck_res`
                    is the resolution of the autoencoder, representing the donut bar chart
                - vectors (numpy.ndarray): Array of size (number_of_transition_steps, `bottleneck_res`),
                    where `bottleneck_res` is the resolution of the autoencoder, representing the 
                    compressed images of all the steps from bar to donut
            
            Output:
                - proj_scalars (numpy.ndarray): Vector array of size (number_of_transition_steps), giving the
                    relative position of the transition steps on the straight line passing through start
                    and finish (with start as origin)
                - follow_up_vectors (numpy.ndarray): Array of size (number_of_transition_steps, `bottleneck_res`),
                    where `bottleneck_res` is the resolution of the autoencoder. Each vector represent a normalized
                    vector allowing to reach the transition step from the projected point given by proj_scalars

        """
        # 
        proj_scalars = np.dot((vectors - start), (finish - start)) / np.norm(finish - start)**2
        follow_up_vectors = ((vectors - start) - proj_scalars*(finish - start)) / np.norm(finish - start)
        
        return proj_scalars, follow_up_vectors
    
    def apply_interpolation_vectors(start, finish, proj_scalars, follow_up_vectors)
        """
            Input:
                - start (numpy.ndarray): Vector array of size (`bottleneck_res`), where `bottleneck_res`
                    is the resolution of the autoencoder, representing the compressed bar chart
                - finish (numpy.ndarray): Vector array of size (`bottleneck_res`), where `bottleneck_res`
                    is the resolution of the autoencoder, representing the donut bar chart
                - vectors (numpy.ndarray): Array of size (number_of_transition_steps, `bottleneck_res`),
                    where `bottleneck_res` is the resolution of the autoencoder, representing the 
                    compressed images of all the steps from bar to donut
                - proj_scalars (numpy.ndarray): Vector array of size (number_of_transition_steps), giving the
                    relative position of the transition steps on the straight line passing through start
                    and finish (with start as origin)
                - follow_up_vectors (numpy.ndarray): Array of size (number_of_transition_steps, `bottleneck_res`),
                    where `bottleneck_res` is the resolution of the autoencoder. Each vector represent a normalized
                    vector allowing to reach the transition step from the projected point given by proj_scalars
            
            Output:
                - interpolated_points (numpy.ndarray): Array of size (number_of_transition_steps, `bottleneck_res`),
                    where `bottleneck_res` is the resolution of the autoencoder. Each element represents a predicted
                    point. The decoder is ready to be applied on every single element of it

        """
        interpolated_points = start + (proj_scalars * (finish - start)) + follow_up_vectors * np.norm(finish - start) 

        return interpolated_points