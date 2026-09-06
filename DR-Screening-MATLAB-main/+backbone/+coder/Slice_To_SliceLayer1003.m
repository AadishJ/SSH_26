classdef Slice_To_SliceLayer1003 < nnet.layer.Layer & nnet.layer.Formattable
    % A custom layer auto-generated while importing an ONNX network.
    %#codegen

    %#ok<*PROPLC>
    %#ok<*NBRAK>
    %#ok<*INUSL>
    %#ok<*VARARG>
    properties (Learnable)
    end

    properties (State)
    end

    properties
        Vars
        NumDims
    end

    methods(Static, Hidden)
        % Specify the properties of the class that will not be modified
        % after the first assignment.
        function p = matlabCodegenNontunableProperties(~)
            p = {
                % Constants, i.e., Vars, NumDims and all learnables and states
                'Vars'
                'NumDims'
                };
        end
    end


    methods(Static, Hidden)
        % Instantiate a codegenable layer instance from a MATLAB layer instance
        function this_cg = matlabCodegenToRedirected(mlInstance)
            this_cg = backbone.coder.Slice_To_SliceLayer1003(mlInstance);
        end
        function this_ml = matlabCodegenFromRedirected(cgInstance)
            this_ml = backbone.Slice_To_SliceLayer1003(cgInstance.Name);
            if isstruct(cgInstance.Vars)
                names = fieldnames(cgInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this_ml.Vars.(fieldname) = dlarray(cgInstance.Vars.(fieldname));
                end
            else
                this_ml.Vars = [];
            end
            this_ml.NumDims = cgInstance.NumDims;
        end
    end

    methods
        function this = Slice_To_SliceLayer1003(mlInstance)
            this.Name = mlInstance.Name;
            this.OutputNames = {'onnx__Add_509'};
            if isstruct(mlInstance.Vars)
                names = fieldnames(mlInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this.Vars.(fieldname) = backbone.coder.ops.extractIfDlarray(mlInstance.Vars.(fieldname));
                end
            else
                this.Vars = [];
            end

            this.NumDims = mlInstance.NumDims;
        end

        function [onnx__Add_509] = predict(this, onnx__Slice_670__)
            if isdlarray(onnx__Slice_670__)
                onnx__Slice_670_ = stripdims(onnx__Slice_670__);
            else
                onnx__Slice_670_ = onnx__Slice_670__;
            end
            onnx__Slice_670NumDims = 4;
            onnx__Slice_670 = backbone.coder.ops.permuteInputVar(onnx__Slice_670_, [4 3 1 2], 4);

            [onnx__Add_509__, onnx__Add_509NumDims__] = Slice_To_SliceGraph1006(this, onnx__Slice_670, onnx__Slice_670NumDims, false);
            onnx__Add_509_ = backbone.coder.ops.permuteOutputVar(onnx__Add_509__, [3 4 2 1], 4);

            onnx__Add_509 = dlarray(single(onnx__Add_509_), 'SSCB');
        end

        function [onnx__Add_509, onnx__Add_509NumDims1007] = Slice_To_SliceGraph1006(this, onnx__Slice_670, onnx__Slice_670NumDims, Training)

            % Execute the operators:
            % Slice:
            [indices1006, onnx__Slice_504NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_670, this.Vars.onnx__Slice_501, this.Vars.onnx__Slice_502, this.Vars.onnx__Slice_500, this.Vars.onnx__Slice_503, coder.const(onnx__Slice_670NumDims));
            onnx__Slice_504 = onnx__Slice_670(indices1006{:});

            % Slice:
            [indices1007, onnx__Add_509NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_504, this.Vars.onnx__Slice_506, this.Vars.onnx__Slice_507, this.Vars.onnx__Slice_505, this.Vars.onnx__Slice_508, coder.const(onnx__Slice_504NumDims));
            onnx__Add_509 = onnx__Slice_504(indices1007{:});

            % Set graph output arguments
            onnx__Add_509NumDims1007 = coder.const(onnx__Add_509NumDims);

        end

    end

end